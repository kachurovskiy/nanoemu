import Controller from './controller';
import { beforeEach, describe, expect, it } from '@jest/globals';

describe('Controller', function() {
  let controller: Controller;

  beforeEach(function() {
    controller = new Controller();
  });

  it('should initialize with default values', function() {
    expect(controller.isMetric).toBe(true);
    expect(controller.absolutePositioning).toBe(true);
    expect(controller.feedRate).toBe(100);
    expect(controller.position).toEqual({ X: 0, Z: 0 });
    expect(controller.programs).toEqual({});
    expect(controller.gcodeCommand).toBe("");
    expect(controller.gcodeInBrace).toBe(false);
    expect(controller.gcodeInSemicolon).toBe(false);
    expect(controller.gcodeInSave).toBe(false);
    expect(controller.gcodeSaveName).toBe("");
    expect(controller.gcodeSaveValue).toBe("");
    expect(controller.isOn).toBe(false);
  });

  it('should process command to start and stop the machine', function() {
    expect(controller.processCommand('~')).toBe('');
    expect(controller.isOn).toBe(true);
    expect(controller.processCommand('!')).toBe('');
    expect(controller.isOn).toBe(false);
  });

  it('should process command to set metric and inch mode', function() {
    controller.processCommand('~');
    expect(controller.processCommand('G21')).toBe('ok');
    expect(controller.isMetric).toBe(true);
    expect(controller.processCommand('G20')).toBe('ok');
    expect(controller.isMetric).toBe(false);
  });

  it('should process command to set absolute and relative positioning', function() {
    controller.processCommand('~');
    expect(controller.processCommand('G90')).toBe('ok');
    expect(controller.absolutePositioning).toBe(true);
    expect(controller.processCommand('G91')).toBe('ok');
    expect(controller.absolutePositioning).toBe(false);
  });

  it('should process command to move X and Z axes', function() {
    controller.processCommand('~');
    expect(controller.processCommand('G90 X10 Z20')).toBe('ok');
    expect(controller.position.X).toBe(10);
    expect(controller.position.Z).toBe(20);
    expect(controller.processCommand('G91 X5 Z-5')).toBe('ok');
    expect(controller.position.X).toBe(15);
    expect(controller.position.Z).toBe(15);
  });

  it('should process command to set feed rate', function() {
    controller.processCommand('~');
    expect(controller.processCommand('F150')).toBe('ok');
    expect(controller.feedRate).toBe(150);
  });

  it('should process command to save and delete programs', function() {
    expect(controller.processCommand('"testProgram\nG21"')).toBe('ok');
    expect(controller.programs).toEqual({ testProgram: 'G21' });
    expect(controller.processCommand('"testProgram"')).toBe('ok');
    expect(controller.programs).toEqual({});
  });

  it('should ignore comments in commands', function() {
    controller.processCommand('~');
    expect(controller.processCommand('G21 (set to metric); comment')).toBe('ok');
    expect(controller.isMetric).toBe(true);
  });

  it('should return machine status', function() {
    controller.processCommand('~');
    expect(controller.processCommand('?')).toBe('<Run|WPos:0,0.000,0|FS:100|Id:H1V1>');
  });

  it('should save, list, get, and remove G-code programs', function() {
    expect(controller.saveGcode('testProgram', 'G21')).toBe(true);
    expect(controller.listGcodes()).toEqual(['testProgram']);
    expect(controller.getGcode('testProgram')).toBe('G21');
    expect(controller.removeGcode('testProgram')).toBe(true);
    expect(controller.listGcodes()).toEqual([]);
  });
});
