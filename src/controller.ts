interface Position {
  X: number;
  Z: number;
}

class Controller {
  isMetric: boolean;
  absolutePositioning: boolean;
  feedRate: number;
  position: Position;
  programs: { [key: string]: string };
  gcodeCommand: string;
  gcodeInBrace: boolean;
  gcodeInSemicolon: boolean;
  gcodeInSave: boolean;
  gcodeSaveName: string;
  gcodeSaveValue: string;
  isOn: boolean;
  gcodeInSaveFirstLine: boolean;

  constructor() {
    this.isMetric = true;
    this.absolutePositioning = true;
    this.feedRate = 100;
    this.position = { X: 0, Z: 0 };
    this.programs = {};
    this.gcodeCommand = '';
    this.gcodeInBrace = false;
    this.gcodeInSemicolon = false;
    this.gcodeInSave = false;
    this.gcodeSaveName = '';
    this.gcodeSaveValue = '';
    this.isOn = false;
    this.gcodeInSaveFirstLine = false;
  }

  processCommand(command: string): string {
    let response = 'ok';

    for (let i = 0; i < command.length; i++) {
      let receivedChar = command[i];
      if (this.gcodeInBrace) {
        if (receivedChar === ')') this.gcodeInBrace = false;
      } else if (receivedChar === '(') {
        this.gcodeInBrace = true;
      } else if (receivedChar === ';') {
        this.gcodeInSemicolon = true;
      } else if (this.gcodeInSemicolon) {
        // Ignore comments
      } else if (receivedChar === '!') {
        this.isOn = false;
        response = '';
        console.log("Machine stopped");
      } else if (receivedChar === '~') {
        this.isOn = true;
        response = '';
        console.log("Machine started");
      } else if (receivedChar === '?') {
        response = `<${this.isOn ? "Run" : "Idle"}|WPos:${this.position.X},0.000,${this.position.Z}|FS:${this.feedRate}|Id:H1V1>`;
      } else if (this.gcodeInSave && receivedChar === '"') {
        this.gcodeInSave = false;
        if (this.gcodeSaveName.length === 0) {
          this.programs = {};
          response = 'ok';
        } else if (this.gcodeSaveValue.length > 1) {
          this.programs[this.gcodeSaveName] = this.gcodeSaveValue;
          response = 'ok';
        } else {
          delete this.programs[this.gcodeSaveName];
          response = 'ok';
        }
        this.gcodeSaveName = '';
        this.gcodeSaveValue = '';
      } else if (!this.gcodeInSave && receivedChar === '"') {
        this.gcodeInSave = true;
        this.gcodeInSaveFirstLine = true;
        this.gcodeSaveName = '';
        this.gcodeSaveValue = '';
      } else if (this.gcodeInSaveFirstLine && receivedChar.charCodeAt(0) >= 32) {
        this.gcodeSaveName += receivedChar;
      } else if (this.gcodeInSaveFirstLine && receivedChar.charCodeAt(0) < 32) {
        this.gcodeInSaveFirstLine = false;
        response = 'ok';
      } else if (this.gcodeInSave) {
        this.gcodeSaveValue += receivedChar;
        if (receivedChar.charCodeAt(0) < 32) {
          this.gcodeInBrace = false;
          this.gcodeInSemicolon = false;
          response = 'ok';
        }
      } else if (this.isOn) {
        if (receivedChar === 'G' || receivedChar === 'M' || receivedChar === 'X' || receivedChar === 'Z' || receivedChar === 'F') {
          if (this.gcodeCommand.length > 1 && this.executeGcode(this.gcodeCommand)) response = 'ok';
          this.gcodeCommand = receivedChar;
        } else {
          this.gcodeCommand += receivedChar;
        }
      }
    }

    if (this.gcodeCommand.length > 1) {
      if (this.executeGcode(this.gcodeCommand)) response = 'ok';
      this.gcodeCommand = '';
    }

    return response;
  }

  executeGcode(command: string): boolean {
    const parts = command.split(' ');
    parts.forEach(part => {
      if (part.startsWith('G')) {
        const code = parseInt(part.slice(1));
        switch (code) {
          case 0:
          case 1:
            break;
          case 20:
            this.isMetric = false;
            console.log("Set to inch mode");
            break;
          case 21:
            this.isMetric = true;
            console.log("Set to metric mode");
            break;
          case 90:
            this.absolutePositioning = true;
            console.log("Set to absolute positioning");
            break;
          case 91:
            this.absolutePositioning = false;
            console.log("Set to relative positioning");
            break;
          case 18:
            console.log("Set to ZX plane");
            break;
          default:
            console.log(`Unknown GCode: G${code}`);
            return false;
        }
      } else if (part.startsWith('F')) {
        this.feedRate = parseFloat(part.slice(1));
        console.log(`Feed rate set to ${this.feedRate}`);
      } else if (part.startsWith('X')) {
        let value = parseFloat(part.slice(1));
        if (!isNaN(value)) {
          this.position.X = this.absolutePositioning ? value : this.position.X + value;
          console.log(`Moved X to ${this.position.X}`);
        }
      } else if (part.startsWith('Z')) {
        let value = parseFloat(part.slice(1));
        if (!isNaN(value)) {
          this.position.Z = this.absolutePositioning ? value : this.position.Z + value;
          console.log(`Moved Z to ${this.position.Z}`);
        }
      }
    });
    return true;
  }

  saveGcode(name: string, gcode: string): boolean {
    if (name && gcode) {
      this.programs[name] = gcode;
      return true;
    }
    return false;
  }

  listGcodes(): string[] {
    return Object.keys(this.programs);
  }

  getGcode(name: string): string | null {
    return this.programs[name] || null;
  }

  removeGcode(name: string): boolean {
    if (this.programs[name]) {
      delete this.programs[name];
      return true;
    }
    return false;
  }
}

export default Controller;
