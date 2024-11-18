import {ZodType, z} from "zod";
import {zodFunction} from "openai/helpers/zod";

export type FunctionToolDef<Parameters extends ZodType> = {
  name: string;
  parameters: Parameters;
  function: (args: z.infer<Parameters>) => unknown | Promise<unknown>;
};

export const toTool = <Parameters extends ZodType>(toolDef: FunctionToolDef<ZodType>) =>{
  return zodFunction({
    name: toolDef.name,
    description: toolDef.parameters.description,
    parameters: toolDef.parameters,
    function: toolDef.function
  })
}