export interface GroqTranscriptionSegment {
  text: string;
  start?: number;
  end?: number;
}

export interface GroqTranscription {
  text?: string;
  segments?: GroqTranscriptionSegment[];
}
