import { useMemo } from "react";
import { Node, Edge, GeneratedPrompt } from "../types/nodeTypes";
import { generatePromptFromWorkflow, validateWorkflow } from "../utils/promptGenerator";

export const usePromptGenerator = (nodes: Node[], edges: Edge[]) => {
  const generatedPrompt: GeneratedPrompt = useMemo(() => {
    return generatePromptFromWorkflow(nodes, edges);
  }, [nodes, edges]);

  const validation = useMemo(() => {
    return validateWorkflow(nodes, edges);
  }, [nodes, edges]);

  const isPromptValid = useMemo(() => {
    return validation.isValid;
  }, [validation.isValid]);

  const promptErrors = useMemo(() => {
    return validation.errors;
  }, [validation.errors]);

  return {
    generatedPrompt,
    validation,
    isPromptValid,
    promptErrors,
  };
};
