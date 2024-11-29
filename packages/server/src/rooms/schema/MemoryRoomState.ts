import { ArraySchema, Schema, type } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

export class MemoryRoomState extends Schema {

  @type([ "number" ]) 
  numbers = new ArraySchema<number>();

  @type([ "number" ]) 
  number_state = new ArraySchema<number>();

  @type([ "string" ]) 
  answerer = new ArraySchema<string>();

  @type([ PlayerState ]) 
  players = new ArraySchema<PlayerState>();

  @type( "string" )
  activePlayer: string;

  @type( "boolean" )
  block = false;

  @type( "boolean" )
  peek = true;
}
