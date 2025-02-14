"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("./controller"));
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Controller', function () {
    let controller;
    (0, globals_1.beforeEach)(function () {
        controller = new controller_1.default();
    });
    (0, globals_1.it)('should initialize with default values', function () {
        (0, globals_1.expect)(controller.isMetric).toBe(true);
        (0, globals_1.expect)(controller.absolutePositioning).toBe(true);
        (0, globals_1.expect)(controller.feedRate).toBe(100);
        (0, globals_1.expect)(controller.position).toEqual({ X: 0, Z: 0 });
        (0, globals_1.expect)(controller.programs).toEqual({});
        (0, globals_1.expect)(controller.gcodeCommand).toBe("");
        (0, globals_1.expect)(controller.gcodeInBrace).toBe(false);
        (0, globals_1.expect)(controller.gcodeInSemicolon).toBe(false);
        (0, globals_1.expect)(controller.gcodeInSave).toBe(false);
        (0, globals_1.expect)(controller.gcodeSaveName).toBe("");
        (0, globals_1.expect)(controller.gcodeSaveValue).toBe("");
        (0, globals_1.expect)(controller.isOn).toBe(false);
    });
    (0, globals_1.it)('should process command to start and stop the machine', function () {
        (0, globals_1.expect)(controller.processCommand('~')).toBe('');
        (0, globals_1.expect)(controller.isOn).toBe(true);
        (0, globals_1.expect)(controller.processCommand('!')).toBe('');
        (0, globals_1.expect)(controller.isOn).toBe(false);
    });
    (0, globals_1.it)('should process command to set metric and inch mode', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('G21')).toBe('ok');
        (0, globals_1.expect)(controller.isMetric).toBe(true);
        (0, globals_1.expect)(controller.processCommand('G20')).toBe('ok');
        (0, globals_1.expect)(controller.isMetric).toBe(false);
    });
    (0, globals_1.it)('should process command to set absolute and relative positioning', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('G90')).toBe('ok');
        (0, globals_1.expect)(controller.absolutePositioning).toBe(true);
        (0, globals_1.expect)(controller.processCommand('G91')).toBe('ok');
        (0, globals_1.expect)(controller.absolutePositioning).toBe(false);
    });
    (0, globals_1.it)('should process command to move X and Z axes', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('G90 X10 Z20')).toBe('ok');
        (0, globals_1.expect)(controller.position.X).toBe(10);
        (0, globals_1.expect)(controller.position.Z).toBe(20);
        (0, globals_1.expect)(controller.processCommand('G91 X5 Z-5')).toBe('ok');
        (0, globals_1.expect)(controller.position.X).toBe(15);
        (0, globals_1.expect)(controller.position.Z).toBe(15);
    });
    (0, globals_1.it)('should process command to set feed rate', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('F150')).toBe('ok');
        (0, globals_1.expect)(controller.feedRate).toBe(150);
    });
    (0, globals_1.it)('should process command to save and delete programs', function () {
        (0, globals_1.expect)(controller.processCommand('"testProgram\nG21"')).toBe('ok');
        (0, globals_1.expect)(controller.programs).toEqual({ testProgram: 'G21' });
        (0, globals_1.expect)(controller.processCommand('"testProgram"')).toBe('ok');
        (0, globals_1.expect)(controller.programs).toEqual({});
    });
    (0, globals_1.it)('should ignore comments in commands', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('G21 (set to metric); comment')).toBe('ok');
        (0, globals_1.expect)(controller.isMetric).toBe(true);
    });
    (0, globals_1.it)('should return machine status', function () {
        controller.processCommand('~');
        (0, globals_1.expect)(controller.processCommand('?')).toBe('<Run|WPos:0,0.000,0|FS:100|Id:H1V1>');
    });
    (0, globals_1.it)('should save, list, get, and remove G-code programs', function () {
        (0, globals_1.expect)(controller.saveGcode('testProgram', 'G21')).toBe(true);
        (0, globals_1.expect)(controller.listGcodes()).toEqual(['testProgram']);
        (0, globals_1.expect)(controller.getGcode('testProgram')).toBe('G21');
        (0, globals_1.expect)(controller.removeGcode('testProgram')).toBe(true);
        (0, globals_1.expect)(controller.listGcodes()).toEqual([]);
    });
});
