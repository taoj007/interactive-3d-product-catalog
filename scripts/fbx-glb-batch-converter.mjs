#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'

const ROOT_DIR = process.cwd()
const INPUT_DIR = path.join(ROOT_DIR, 'input')
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'models')
const WORK_DIR = path.join(ROOT_DIR, 'work')
const LOGS_DIR = path.join(ROOT_DIR, 'logs')
const BLENDER_HELPER = path.join(ROOT_DIR, 'scripts', 'blender-fbx-to-glb.py')
const LOCAL_GLTF_TRANSFORM = path.join(
  ROOT_DIR,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'gltf-transform.cmd' : 'gltf-transform'
)
const TARGET_SIZE_BYTES = 10 * 1024 * 1024
const BASE_TEXTURE_QUALITY = 82
const SCALAR_TEXTURE_QUALITY = 76

const TEXTURE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.tga', '.bmp', '.tif', '.tiff'])

const MAP_PATTERNS = {
  baseColor: ['diffuse', 'color', 'albedo', 'basecolor', 'base_color'],
  normal: ['normal', 'nrm'],
  glossiness: ['gloss', 'glossiness'],
  roughness: ['rough', 'roughness'],
  specular: ['spec', 'specular'],
}

function parseArgs(argv) {
  const options = {
    model: null,
    resolution: 1024,
    keepWork: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--model') {
      options.model = argv[index + 1] ?? null
      index += 1
      continue
    }

    if (arg === '--resolution') {
      const rawValue = Number.parseInt(argv[index + 1] ?? '', 10)

      if (Number.isFinite(rawValue) && rawValue > 0) {
        options.resolution = rawValue
      }

      index += 1
      continue
    }

    if (arg === '--keep-work') {
      options.keepWork = true
    }
  }

  return options
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(
        new Error(
          `${command} exited with code ${code}\n${stderr || stdout}`.trim()
        )
      )
    })
  })
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function ensureDirectory(targetPath) {
  await fs.mkdir(targetPath, { recursive: true })
}

async function detectAvailableCommand(candidates) {
  for (const candidate of candidates) {
    try {
      await runCommand('which', [candidate])
      return candidate
    } catch {
      continue
    }
  }

  return null
}

async function detectGltfTransformCommand() {
  if (await pathExists(LOCAL_GLTF_TRANSFORM)) {
    return LOCAL_GLTF_TRANSFORM
  }

  return detectAvailableCommand(['gltf-transform'])
}

async function loadSharp() {
  try {
    const sharpModule = await import('sharp')
    return sharpModule.default
  } catch (error) {
    throw new Error(
      `Missing dependency "sharp". Install it with "npm install sharp" before running this converter.\n${error instanceof Error ? error.message : String(error)}`
    )
  }
}

async function collectModelJobs(inputDir, requestedModel) {
  if (!(await pathExists(inputDir))) {
    throw new Error(`Missing input directory: ${inputDir}`)
  }

  const entries = await fs.readdir(inputDir, { withFileTypes: true })
  const directories = entries.filter((entry) => entry.isDirectory())

  const jobs = directories
    .filter((entry) => !requestedModel || entry.name === requestedModel)
    .map(async (entry) => {
      const modelDir = path.join(inputDir, entry.name)
      const modelDirEntries = await fs.readdir(modelDir, { withFileTypes: true })
      const files = modelDirEntries.filter((item) => item.isFile()).map((item) => item.name)
      const fbxFiles = files.filter((fileName) => path.extname(fileName).toLowerCase() === '.fbx')
      const rarFiles = files.filter((fileName) => path.extname(fileName).toLowerCase() === '.rar')

      return {
        id: entry.name,
        modelDir,
        fbxPath: fbxFiles[0] ? path.join(modelDir, fbxFiles[0]) : null,
        rarPath: rarFiles[0] ? path.join(modelDir, rarFiles[0]) : null,
        extraFbxFiles: fbxFiles.slice(1),
        extraRarFiles: rarFiles.slice(1),
      }
    })

  const resolvedJobs = await Promise.all(jobs)

  if (requestedModel && jobs.length === 0) {
    throw new Error(`Model "${requestedModel}" was not found under input/`)
  }

  return resolvedJobs
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function listFilesRecursive(rootDir) {
  const items = []
  const entries = await fs.readdir(rootDir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name)

    if (entry.isDirectory()) {
      items.push(...(await listFilesRecursive(entryPath)))
      continue
    }

    items.push(entryPath)
  }

  return items
}

async function collectTextureFiles(rootDir) {
  const files = await listFilesRecursive(rootDir)

  return files.filter((filePath) => {
    const extension = path.extname(filePath).toLowerCase()

    if (!TEXTURE_EXTENSIONS.has(extension)) {
      return false
    }

    return path.basename(filePath).toLowerCase() !== 'model.fbx'
  })
}

function detectTextureMaps(textureFiles) {
  const detected = {
    baseColor: null,
    normal: null,
    glossiness: null,
    roughness: null,
    specular: null,
  }
  const unmatched = []

  for (const textureFile of textureFiles) {
    const normalized = normalizeName(path.basename(textureFile))
    let matched = false

    for (const [mapType, patterns] of Object.entries(MAP_PATTERNS)) {
      if (detected[mapType]) {
        continue
      }

      if (patterns.some((pattern) => normalized.includes(pattern))) {
        detected[mapType] = textureFile
        matched = true
        break
      }
    }

    if (!matched) {
      unmatched.push(textureFile)
    }
  }

  if (!detected.baseColor && unmatched.length > 0) {
    const ranked = unmatched
      .map((filePath) => ({
        filePath,
        name: path.basename(filePath),
      }))
      .sort((left, right) => left.name.length - right.name.length)

    detected.baseColor = ranked[0].filePath
  }

  return detected
}

async function extractTextures({ extractor, rarPath, destinationDir }) {
  await ensureDirectory(destinationDir)

  if (extractor === '7z') {
    await runCommand('7z', ['x', '-y', `-o${destinationDir}`, rarPath])
    return
  }

  if (extractor === 'unar') {
    await runCommand('unar', ['-force-overwrite', '-output-directory', destinationDir, rarPath])
    return
  }

  throw new Error(`Unsupported extractor: ${extractor}`)
}

async function processTextureMaps({
  sharp,
  detectedMaps,
  processedDir,
  resolution,
  warnings,
}) {
  await ensureDirectory(processedDir)

  const processed = {}

  for (const [mapType, sourcePath] of Object.entries(detectedMaps)) {
    if (!sourcePath || mapType === 'glossiness') {
      continue
    }

    let pipeline = sharp(sourcePath).resize({
      width: resolution,
      height: resolution,
      fit: 'inside',
      withoutEnlargement: true,
    })

    if (mapType === 'normal') {
      pipeline = pipeline.removeAlpha()
    } else if (mapType !== 'baseColor') {
      pipeline = pipeline.removeAlpha().grayscale()
    }

    const outputExtension = mapType === 'normal' ? 'png' : 'jpg'
    const outputPath = path.join(processedDir, `${mapType}.${outputExtension}`)

    if (outputExtension === 'png') {
      await pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true,
        })
        .toFile(outputPath)
    } else {
      const quality = mapType === 'baseColor' ? BASE_TEXTURE_QUALITY : SCALAR_TEXTURE_QUALITY

      await pipeline
        .jpeg({
          quality,
          mozjpeg: true,
          chromaSubsampling: '4:4:4',
        })
        .toFile(outputPath)
    }

    processed[mapType] = outputPath
  }

  if (!processed.roughness && detectedMaps.glossiness) {
    const outputPath = path.join(processedDir, 'roughness.jpg')

    await sharp(detectedMaps.glossiness)
      .resize({
        width: resolution,
        height: resolution,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .removeAlpha()
      .grayscale()
      .negate()
      .jpeg({
        quality: SCALAR_TEXTURE_QUALITY,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      })
      .toFile(outputPath)

    processed.roughness = outputPath
    warnings.push('Missing roughness map. Generated roughness by inverting glossiness.')
  }

  return processed
}

async function convertFbxToGlb({
  blenderCommand,
  job,
  processedMaps,
  outputPath,
  workDir,
}) {
  const manifestPath = path.join(workDir, 'conversion-manifest.json')
  const manifest = {
    modelName: job.id,
    fbxPath: job.fbxPath,
    outputPath,
    maps: processedMaps,
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  await runCommand(blenderCommand, [
    '--background',
    '--python',
    BLENDER_HELPER,
    '--',
    manifestPath,
  ])
}

async function optimizeGlb({
  gltfTransformCommand,
  inputPath,
  outputPath,
  warnings,
}) {
  if (!gltfTransformCommand) {
    throw new Error(
      'Missing gltf-transform CLI. Install it with "npm install -D @gltf-transform/cli" to enable the optimization stage.'
    )
  }

  try {
    await runCommand(gltfTransformCommand, [
      'optimize',
      inputPath,
      outputPath,
      '--compress',
      'draco',
      '--texture-compress',
      'webp',
    ])
  } catch (error) {
    warnings.push(
      `glTF Transform optimization was skipped: ${error instanceof Error ? error.message : String(error)}`
    )

    await fs.copyFile(inputPath, outputPath)
  }
}

async function validateOutput(outputPath, warnings) {
  const stats = await fs.stat(outputPath)

  if (stats.size > TARGET_SIZE_BYTES) {
    warnings.push(
      `Output is ${(stats.size / (1024 * 1024)).toFixed(2)} MB, above the 10 MB target.`
    )
  }

  return {
    sizeBytes: stats.size,
  }
}

async function writeModelLog(logPath, payload) {
  await fs.writeFile(logPath, JSON.stringify(payload, null, 2))
}

async function cleanDirectory(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true })
  await fs.mkdir(targetPath, { recursive: true })
}

async function processModel({
  job,
  extractor,
  blenderCommand,
  gltfTransformCommand,
  sharp,
  options,
}) {
  const warnings = []
  const errors = []
  const outputPath = path.join(OUTPUT_DIR, `${job.id}.glb`)
  const modelWorkDir = path.join(WORK_DIR, job.id)
  const extractedDir = path.join(modelWorkDir, 'textures-extracted')
  const processedDir = path.join(modelWorkDir, 'textures-processed')
  const blenderOutputPath = path.join(modelWorkDir, `${job.id}.raw.glb`)
  const logPath = path.join(LOGS_DIR, `${job.id}.json`)

  try {
    if (!(await pathExists(job.fbxPath))) {
      throw new Error(`No .fbx file found in ${job.modelDir}`)
    }

    if (job.extraFbxFiles.length > 0) {
      warnings.push(
        `Multiple .fbx files found. Using ${path.basename(job.fbxPath)} and ignoring ${job.extraFbxFiles.join(', ')}.`
      )
    }

    if (job.extraRarFiles.length > 0) {
      warnings.push(
        `Multiple .rar files found. Using ${path.basename(job.rarPath)} and ignoring ${job.extraRarFiles.join(', ')}.`
      )
    }

    await cleanDirectory(modelWorkDir)
    let textureFiles = []
    const hasRar = Boolean(job.rarPath) && await pathExists(job.rarPath)

    if (hasRar && extractor) {
      await extractTextures({
        extractor,
        rarPath: job.rarPath,
        destinationDir: extractedDir,
      })
      textureFiles = await collectTextureFiles(extractedDir)
    } else {
      if (hasRar && !extractor) {
        warnings.push(
          'textures.rar found, but no extractor is installed. Falling back to unpacked textures in the model folder.'
        )
      } else if (!hasRar) {
        warnings.push('textures.rar not found. Falling back to unpacked textures in the model folder.')
      }

      textureFiles = await collectTextureFiles(job.modelDir)
    }

    if (textureFiles.length === 0) {
      if (hasRar && !extractor) {
        throw new Error(
          `No supported unpacked textures were found in ${job.modelDir}. Install 7z or unar, or extract textures.rar into the model folder first.`
        )
      }

      throw new Error(`No supported textures were found in ${job.modelDir}`)
    }

    const detectedMaps = detectTextureMaps(textureFiles)

    if (!detectedMaps.baseColor) {
      throw new Error(`No base color texture detected for ${job.id}`)
    }

    if (!detectedMaps.roughness && !detectedMaps.glossiness) {
      warnings.push('No roughness or glossiness map detected.')
    }

    if (!detectedMaps.normal) {
      warnings.push('No normal map detected.')
    }

    if (detectedMaps.specular) {
      warnings.push('Specular map detected. It will be connected only if Blender exposes a specular socket.')
    }

    const processedMaps = await processTextureMaps({
      sharp,
      detectedMaps,
      processedDir,
      resolution: options.resolution,
      warnings,
    })

    await convertFbxToGlb({
      blenderCommand,
      job,
      processedMaps,
      outputPath: blenderOutputPath,
      workDir: modelWorkDir,
    })

    await optimizeGlb({
      gltfTransformCommand,
      inputPath: blenderOutputPath,
      outputPath,
      warnings,
    })

    const validation = await validateOutput(outputPath, warnings)

    const result = {
      model: job.id,
      status: warnings.length > 0 ? 'WARNING' : 'SUCCESS',
      outputPath,
      outputSizeBytes: validation.sizeBytes,
      warnings,
      errors,
      detectedMaps,
      processedMaps,
    }

    await writeModelLog(logPath, result)

    if (!options.keepWork) {
      await fs.rm(modelWorkDir, { recursive: true, force: true })
    }

    return result
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))

    const result = {
      model: job.id,
      status: 'FAILED',
      outputPath,
      warnings,
      errors,
    }

    await writeModelLog(logPath, result)
    return result
  }
}

function formatSummary(results) {
  return results
    .map((result) => {
      const detail =
        result.status === 'SUCCESS'
          ? ''
          : `: ${(result.errors?.[0] ?? result.warnings?.[0] ?? '').trim()}`

      return `${result.model.padEnd(24)} ${result.status}${detail}`
    })
    .join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const sharp = await loadSharp()
  const extractor = await detectAvailableCommand(['7z', 'unar'])
  const blenderCommand = await detectAvailableCommand(['blender'])
  const gltfTransformCommand = await detectGltfTransformCommand()

  if (!blenderCommand) {
    throw new Error('Missing Blender CLI. Install Blender and make "blender" available on PATH.')
  }

  await Promise.all([
    ensureDirectory(INPUT_DIR),
    ensureDirectory(OUTPUT_DIR),
    ensureDirectory(WORK_DIR),
    ensureDirectory(LOGS_DIR),
  ])

  const jobs = await collectModelJobs(INPUT_DIR, options.model)

  if (jobs.length === 0) {
    console.log('No model folders found under input/.')
    return
  }

  const results = []

  for (const job of jobs) {
    console.log(`Processing ${job.id}...`)
    results.push(
      await processModel({
        job,
        extractor,
        blenderCommand,
        gltfTransformCommand,
        sharp,
        options,
      })
    )
  }

  const summary = formatSummary(results)
  const summaryPath = path.join(LOGS_DIR, 'latest-summary.txt')

  await fs.writeFile(summaryPath, `${summary}\n`)
  console.log(summary)
  console.log(`\nSummary written to ${summaryPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
