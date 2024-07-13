import { APP } from "./App";

class StartMenu {
  constructor() {
    this.setting = doccument.querySelector(".settings-panel");
    this.setting.style.display = "none";
    this.setting.style.height = "100px";
    this.setting.style.width = "300px";
    this.parameters = { brigthness: 50, speed: 75 };
  }
  createScrollbar() {}
}
