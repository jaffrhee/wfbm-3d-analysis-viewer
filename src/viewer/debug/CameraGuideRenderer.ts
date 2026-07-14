import {
    ArcRotateCamera,
    Color3,
    LinesMesh,
    Mesh,
    MeshBuilder,
    Scene,
    Vector3,
} from "@babylonjs/core";

export class CameraGuideRenderer {
    private readonly scene: Scene;
    private readonly camera: ArcRotateCamera;

    private guideLine: LinesMesh;
    private targetMarker: Mesh;

    private visible = false;

    // 점선 조각 수는 생성 후 변경하지 않는다.
    //private readonly dashCount = 24;

    // Camera 바로 앞부터 선을 시작한다.
    // Camera 위치에서 시작하면 Near Plane 때문에 시작 부분이 보이지 않는다.
    //private readonly cameraStartOffset = 2;

    constructor(scene: Scene, camera: ArcRotateCamera) {
        this.scene = scene;
        this.camera = camera;

        this.guideLine = this.createGuideLine();
        this.targetMarker = this.createTargetMarker();

        this.setVisible(false);

        this.scene.onBeforeRenderObservable.add(this.update);
    }

    setVisible(visible: boolean) {
        this.visible = visible;

        this.guideLine.setEnabled(visible);
        this.targetMarker.setEnabled(visible);

        if (visible) {
            this.update();
        }
    }

    getVisible() {
        return this.visible;
    }

    dispose() {
        this.scene.onBeforeRenderObservable.removeCallback(this.update);

        this.guideLine.dispose();
        this.targetMarker.dispose();
    }

    private createGuideLine() {
        const guideLine = MeshBuilder.CreateLines(
            "cameraGuideLine",
            {
                points: this.buildGuidePoints(),
                updatable: true,
            },
            this.scene,
        );

        guideLine.color = new Color3(0.3, 0.9, 1.0);
        guideLine.isPickable = false;
        guideLine.alwaysSelectAsActiveMesh = true;
        guideLine.renderingGroupId = 2;

        return guideLine;
    }

    private createTargetMarker() {
        const marker = MeshBuilder.CreateSphere(
            "cameraTargetMarker",
            {
                diameter: 0.8,
                segments: 12,
            },
            this.scene,
        );

        marker.position.copyFrom(this.camera.target);
        marker.isPickable = false;
        marker.alwaysSelectAsActiveMesh = true;
        marker.renderingGroupId = 2;

        return marker;
    }

    private update = () => {
        if (!this.visible) {
            return;
        }

        MeshBuilder.CreateLines(
            "cameraGuideLine",
            {
                points: this.buildGuidePoints(),
                instance: this.guideLine,
            },
            this.scene,
        );

        this.targetMarker.position.copyFrom(this.camera.target);
    };


    /*private buildDashSegments(): Vector3[][] {
        const cameraPosition = this.camera.position;
        const targetPosition = this.camera.target;

        const direction = targetPosition.subtract(cameraPosition);
        const distance = direction.length();

        if (distance <= 0.0001) {
            return this.createCollapsedSegments(targetPosition);
        }

        direction.normalize();

        const startOffset = Math.min(
            this.cameraStartOffset,
            Math.max(0, distance * 0.1),
        );

        const start = cameraPosition.add(direction.scale(startOffset));
        const remainingDistance = Vector3.Distance(start, targetPosition);

        if (remainingDistance <= 0.0001) {
            return this.createCollapsedSegments(targetPosition);
        }

        const segmentLength = remainingDistance / this.dashCount;
        const dashRatio = 0.55;

        const lines: Vector3[][] = [];

        for (let index = 0; index < this.dashCount; index += 1) {
            const dashStartDistance = segmentLength * index;
            const dashEndDistance =
                dashStartDistance + segmentLength * dashRatio;

            const dashStart = start.add(
                direction.scale(dashStartDistance),
            );

            const dashEnd = start.add(
                direction.scale(
                    Math.min(dashEndDistance, remainingDistance),
                ),
            );

            lines.push([dashStart, dashEnd]);
        }

        return lines;
    }*/

    private buildGuidePoints(): Vector3[] {
        const cameraPosition = this.camera.position;
        const targetPosition = this.camera.target;

        // Camera → Target 방향
        const forward = targetPosition
            .subtract(cameraPosition)
            .normalize();

        // 시선 방향과 수직인 오른쪽 방향
        const right = Vector3.Cross(
            forward,
            this.camera.upVector,
        ).normalize();

        // 현재 Radius에 비례해 화면에서 보일 정도로 이동
        const forwardOffset = Math.max(2, this.camera.radius * 0.03);
        const sideOffset = Math.max(2, this.camera.radius * 0.03);

        const visibleStart = cameraPosition
            .add(forward.scale(forwardOffset))
            .add(right.scale(sideOffset));

        return [
            visibleStart,
            targetPosition.clone(),
        ];
    }

    /*private createCollapsedSegments(position: Vector3): Vector3[][] {
        return Array.from({ length: this.dashCount }, () => [
            position.clone(),
            position.clone(),
        ]);
    }*/
}