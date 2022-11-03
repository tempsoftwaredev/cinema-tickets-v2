export class errorSpy {
  #testMethod
  #errorSpy = jest.fn();

  constructor(testMethod){
    this.#testMethod = testMethod;
  }

  run() { 
    try {
      return this.#testMethod();
    } catch (e) {
      this.#errorSpy(e);
      return this.#errorSpy.mock.calls[0][0];
    }
  }
}