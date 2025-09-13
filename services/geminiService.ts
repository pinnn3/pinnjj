import { GoogleGenAI, Type } from "@google/genai";

const VIDEO_MODEL = 'veo-3.0-fast-generate-001';
const TEXT_MODELS_FALLBACK_ORDER = ['gemini-2.5-flash'];


export const generateVideo = async (prompt: string, veoApiKey: string): Promise<string> => {
  if (!veoApiKey) {
    throw new Error("VEO API Key is not provided.");
  }
  const ai = new GoogleGenAI({ apiKey: veoApiKey });

  try {
    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: '9:16',
      },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        const errorMessage = String((operation.error as any)?.message || 'The video generation operation failed without a specific error message.');
        throw new Error(errorMessage);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation completed, but no download link was provided by the API.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${veoApiKey}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video file. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided VEO API Key is not valid. Please check it in the Setup tab.');
        }
        if (error.message.includes('"status":"NOT_FOUND"')) {
            throw new Error(`The video model '${VIDEO_MODEL}' was not found. It may be incorrect or unavailable in your region.`);
        }
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during video generation.");
  }
};


export const generateJsonPrompts = async (
  mainIdea: string,
  numScenes: number,
  includeDialog: boolean,
  visualStyle: string,
  geminiApiKey: string,
): Promise<string[]> => {
  if (!geminiApiKey) {
    throw new Error("Gemini API Key is not provided.");
  }
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const generatedPrompts: string[] = [];
  let previousSceneJson: string | null = null;

  for (let i = 1; i <= numScenes; i++) {
    let userPrompt = `
      Main Idea: "${mainIdea}"
      Visual Style: "${visualStyle}"
      Scene Number: ${i} of ${numScenes}
      Include Dialogue in Bahasa Indonesia: ${includeDialog ? 'Yes' : 'No'}
    `;

    if (i === 1) {
      userPrompt += `
        This is the first scene. Based on the Main Idea, create a compelling character.
        Establish the setting and the initial action.
        Ensure the character's description and consistent features are well-defined.
      `;
    } else {
      userPrompt += `
        This is a subsequent scene. Continue the story from the previous scene's JSON.
        Maintain character consistency using the details from the previous scene's JSON.
        Create a natural story progression.
        Previous Scene JSON for context: ${previousSceneJson}
      `;
    }

    let sceneGenerated = false;
    let lastError: Error | null = null;
    
    for (const model of TEXT_MODELS_FALLBACK_ORDER) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: userPrompt,
                config: {
                responseMimeType: "application/json",
                systemInstruction: `You are an expert screenwriter for an AI video generator. Your task is to create a detailed JSON prompt for a single scene.
                - Based on the user's main idea, you must invent and create a consistent character (name, description, outfit, personality, consistent_features). This character must be maintained across all scenes.
                - The 'consistent_features' and 'avoid_changes' arrays are crucial for character consistency. Populate them with key visual traits.
                - Creatively determine the 'camera' style (angles, movement) and add descriptive details to the visual style.
                - If dialogue is requested, make it short, natural, and in Bahasa Indonesia.
                - The 'transition_to_next_scene' should be a brief, creative description of how this scene ends and the next begins.
                - Only output the raw JSON object, without any markdown formatting like \`\`\`json.`,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                    scene: {
                        type: Type.OBJECT,
                        properties: {
                        id: { type: Type.NUMBER },
                        setting: { type: Type.STRING },
                        action: { type: Type.STRING },
                        character: {
                            type: Type.OBJECT,
                            properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            outfit: { type: Type.STRING },
                            consistent_features: { type: Type.ARRAY, items: { type: Type.STRING } },
                            personality: { type: Type.STRING }
                            }
                        },
                        style: {
                            type: Type.OBJECT,
                            properties: {
                            visual: { type: Type.STRING },
                            camera: { type: Type.STRING }
                            }
                        },
                        dialogue: { type: Type.STRING },
                        transition_to_next_scene: { type: Type.STRING },
                        constraints: {
                            type: Type.OBJECT,
                            properties: {
                            keep_character_consistent: { type: Type.BOOLEAN },
                            avoid_changes: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                        }
                    }
                    }
                }
                },
            });

            const jsonText = response.text;
            JSON.parse(jsonText); // Validate that the response is valid JSON
            generatedPrompts.push(jsonText);
            previousSceneJson = jsonText;
            sceneGenerated = true;
            break; // Success, exit the fallback loop for this scene

        } catch (error) {
            console.warn(`Model ${model} failed for scene ${i}:`, error);
            if (error instanceof Error && error.message.includes('API key not valid')) {
                throw new Error('The provided Gemini API Key is not valid. Please check it in the Setup tab.');
            }
            lastError = error instanceof Error ? error : new Error('An unknown error occurred');
        }
    }

    if (!sceneGenerated) {
        throw new Error(`Failed to generate prompt for Scene ${i} after trying all available models. Last error: ${lastError?.message}`);
    }
  }

  return generatedPrompts;
};