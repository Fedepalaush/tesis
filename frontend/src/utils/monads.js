class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  isNothing() {
    return this.value === null || this.value === undefined;
  }

  map(fn) {
    return this.isNothing() ? this : Maybe.of(fn(this.value));
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }
}

class Either {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  static left(value) {
    return new Either(value, null);
  }

  static right(value) {
    return new Either(null, value);
  }

  isLeft() {
    return this.left !== null;
  }

  isRight() {
    return this.right !== null;
  }

  map(fn) {
    return this.isRight() ? Either.right(fn(this.right)) : this;
  }

  getOrElse(defaultValue) {
    return this.isRight() ? this.right : defaultValue;
  }
}

class Task {
  constructor(fork) {
    this.fork = fork;
  }

  static of(value) {
    return new Task((reject, resolve) => resolve(value));
  }

  map(fn) {
    return new Task((reject, resolve) => this.fork(reject, x => resolve(fn(x))));
  }

  chain(fn) {
    return new Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)));
  }

  fork(reject, resolve) {
    return this.fork(reject, resolve);
  }
}

export { Maybe, Either, Task };
