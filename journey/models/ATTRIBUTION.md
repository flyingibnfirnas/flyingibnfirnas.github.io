# 3D model attributions

## Drone (`drone.glb`)

Local asset from Desktop (`drone.glb`), copied to:

```text
experience/public/models/drone.glb
```

Used for the Bachelor’s aerospace avionics chapter. Confirm license/attribution with the original model source before public publish.

Meshopt-compressed runtime copy; original under `_original/drone.glb`.

## F-16 (`f16.glb`)

Recommended source (CC BY — credit required, commercial OK):

- Model: “F-16 Fighting Falcon | NATO | GameReady” by Pan_Ar4ik
- URL: https://sketchfab.com/3d-models/f-16-fighting-falcon-nato-gameready-1d74c97a06384d318b1d09e0e3811055
- License: Creative Commons Attribution 4.0

After download, rename/copy the `.glb` to:

```text
experience/public/models/f16.glb
```

## Cadillac CT5-V Blackwing (`ct5.glb`)

Local asset from Desktop (`cadillac_ct5-v_blackwing.glb`), copied to:

```text
experience/public/models/ct5.glb
```

## Industrial robot (`robot.glb`)

Local asset from Desktop (`industrial_robot.glb`), copied to:

```text
experience/public/models/robot.glb
```

Used for the Master’s robotic tooling calibration chapter. Confirm license/attribution with the original model source before public publish.

## Airbus fuselage (`airb_fuselage.glb`)

Local asset from Desktop (`airb_fuselage.glb`), copied to:

```text
experience/public/models/airb_fuselage.glb
```

Used for the Virtek Vision laser-templating chapter. Confirm license/attribution with the original model source before public publish.

Meshopt-compressed runtime copy; original under `_original/airb_fuselage.glb`.

## Server rack (`server_rack.glb`)

Local asset from Desktop (`server_rack_and_console_v3.glb`), copied to:

```text
experience/public/models/server_rack.glb
```

Used for the AMD compute-platforms chapter. Confirm license/attribution with the original model source before public publish.

Original under `_original/server_rack.glb`.

## Compression note

Runtime assets in this folder are Meshopt-compressed (and texture-resized) copies of the originals kept under `_original/`. Rebuild with:

```bash
npx @gltf-transform/cli optimize _original/drone.glb drone.glb --compress meshopt --texture-size 1024
npx @gltf-transform/cli optimize _original/f16.glb f16.glb --compress meshopt --texture-size 1024
npx @gltf-transform/cli optimize _original/airb_fuselage.glb airb_fuselage.glb --compress meshopt --texture-size 1024
```
