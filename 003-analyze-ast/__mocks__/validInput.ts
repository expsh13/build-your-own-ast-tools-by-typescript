class Animal {
  species: string;

  constructor(species: string) {
    this.species = species;
  }

  showSpecies() {
    console.log(`この動物は ${this.species} です。`);
  }

  eat(food: string) {
    console.log(`${this.species} は ${food} を食べています。`);
  }

  sleep(hours: number) {
    console.log(`${this.species} は ${hours} 時間眠ります。`);
  }

  move(distance: number) {
    console.log(`${this.species} は ${distance} メートル移動しました。`);
  }
}

class Dog extends Animal {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    super("Dog");

    this.name = name;
    this.age = age;
  }

  showInfo() {
    console.log(`名前: ${this.name}, 年齢: ${this.age}`);
  }

  bark() {
    console.log(`${this.name} が吠えました: ワンワン！`);
  }
}

const pochi = new Dog("ポチ", 3);
pochi.showSpecies(); // この動物は Dog です。
pochi.eat("ドッグフード"); // Dog は ドッグフード を食べています。
pochi.sleep(8); // Dog は 8 時間眠ります。
pochi.move(10); // Dog は 10 メートル移動しました。
pochi.showInfo(); // 名前: ポチ, 年齢: 3
pochi.bark(); // ポチ が吠えました: ワンワン！
