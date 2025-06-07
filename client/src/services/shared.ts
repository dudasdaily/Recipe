export abstract class InitializationSingleton {
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  protected abstract initializeImpl(): Promise<void>;

  protected async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initializeImpl().then(() => {
      this.initialized = true;
    });

    await this.initializationPromise;
  }

  public async initialize(): Promise<void> {
    await this.ensureInitialized();
  }
} 