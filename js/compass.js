export class Compass {
  constructor(container) {
    this.compassContainer = document.createElement("div");
    this.compassContainer.style.position = "absolute";
    this.compassContainer.style.bottom = "10px";
    this.compassContainer.style.right = "10px";
    this.compassContainer.style.width = "100px";
    this.compassContainer.style.height = "100px";
    this.compassContainer.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    this.compassContainer.style.borderRadius = "50%";
    this.compassContainer.style.border = "2px solid black";
    this.compassContainer.style.display = "flex";
    this.compassContainer.style.alignItems = "center";
    this.compassContainer.style.justifyContent = "center";
    this.compassContainer.style.visibility = "hidden"; // 숨긴 상태로 초기화
    container.appendChild(this.compassContainer);

    this.compassNeedle = document.createElement("div");
    this.compassNeedle.style.width = "0";
    this.compassNeedle.style.height = "0";
    this.compassNeedle.style.borderLeft = "15px solid transparent";
    this.compassNeedle.style.borderRight = "15px solid transparent";
    this.compassNeedle.style.borderBottom = "30px solid black";
    this.compassContainer.appendChild(this.compassNeedle);
  }

  show() {
    this.compassContainer.style.visibility = "visible";
  }

  hide() {
    this.compassContainer.style.visibility = "hidden";
  }

  fix_angle(angle) {
    //제대로 된 라디안 값으로 수정
    return angle % (2 * Math.PI);
  }

  update(playerPosition, playerRotation, targetPosition) {
    const dx = targetPosition.x - playerPosition.x;
    const dz = targetPosition.z - playerPosition.z;
    const angleToTarget = Math.atan2(dz, dx);
    let tmp = this.fix_angle(playerRotation.y);
    let res = -Math.PI / 4 + tmp;
    //console.log(tmp);
    const needleAngle = playerRotation.y + Math.PI;
    this.compassNeedle.style.transform = `rotate(${res}rad)`;
  }
}
