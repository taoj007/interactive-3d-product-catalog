import bpy
import json
import os
import sys


def get_manifest_path():
    if "--" not in sys.argv:
        raise RuntimeError("Missing manifest path argument.")

    args = sys.argv[sys.argv.index("--") + 1 :]

    if not args:
        raise RuntimeError("Missing manifest path argument.")

    return args[0]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)
    for block in bpy.data.images:
        bpy.data.images.remove(block)


def load_image(filepath, colorspace):
    image = bpy.data.images.load(filepath, check_existing=True)
    image.colorspace_settings.name = colorspace
    return image


def ensure_socket(node, names):
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            return socket
    return None


def build_material(maps):
    material = bpy.data.materials.new(name="ConvertedWood")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links

    nodes.clear()

    output_node = nodes.new(type="ShaderNodeOutputMaterial")
    output_node.location = (500, 0)

    principled_node = nodes.new(type="ShaderNodeBsdfPrincipled")
    principled_node.location = (180, 0)
    links.new(principled_node.outputs["BSDF"], output_node.inputs["Surface"])

    if maps.get("baseColor"):
        base_node = nodes.new(type="ShaderNodeTexImage")
        base_node.location = (-520, 220)
        base_node.image = load_image(maps["baseColor"], "sRGB")
        links.new(base_node.outputs["Color"], principled_node.inputs["Base Color"])

    if maps.get("roughness"):
        roughness_node = nodes.new(type="ShaderNodeTexImage")
        roughness_node.location = (-520, 0)
        roughness_node.image = load_image(maps["roughness"], "Non-Color")
        links.new(roughness_node.outputs["Color"], principled_node.inputs["Roughness"])

    if maps.get("normal"):
        normal_texture_node = nodes.new(type="ShaderNodeTexImage")
        normal_texture_node.location = (-760, -220)
        normal_texture_node.image = load_image(maps["normal"], "Non-Color")

        normal_map_node = nodes.new(type="ShaderNodeNormalMap")
        normal_map_node.location = (-320, -220)
        links.new(normal_texture_node.outputs["Color"], normal_map_node.inputs["Color"])
        links.new(normal_map_node.outputs["Normal"], principled_node.inputs["Normal"])

    if maps.get("specular"):
        specular_socket = ensure_socket(principled_node, ["Specular IOR Level", "Specular"])

        if specular_socket is not None:
            specular_node = nodes.new(type="ShaderNodeTexImage")
            specular_node.location = (-520, -420)
            specular_node.image = load_image(maps["specular"], "Non-Color")
            links.new(specular_node.outputs["Color"], specular_socket)

    return material


def assign_material_to_meshes(material):
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

    if not mesh_objects:
        raise RuntimeError("FBX import produced no mesh objects.")

    for obj in mesh_objects:
        if len(obj.data.materials) == 0:
            obj.data.materials.append(material)
            continue

        for index in range(len(obj.data.materials)):
            obj.data.materials[index] = material


def main():
    manifest_path = get_manifest_path()

    with open(manifest_path, "r", encoding="utf-8") as handle:
        manifest = json.load(handle)

    clear_scene()
    bpy.ops.import_scene.fbx(filepath=manifest["fbxPath"])

    material = build_material(manifest.get("maps", {}))
    assign_material_to_meshes(material)

    output_dir = os.path.dirname(manifest["outputPath"])
    os.makedirs(output_dir, exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=manifest["outputPath"],
        export_format="GLB",
        use_selection=False,
        export_animations=False,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )


if __name__ == "__main__":
    main()
