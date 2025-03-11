declare module 'pptxjs' {
    class Pptxjs {
      constructor();
      loadFromArrayBuffer(buffer: ArrayBuffer): Promise<void>;
      render(container: HTMLElement): void;
    }
    export = Pptxjs;
  }