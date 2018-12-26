class WordStorage {
  constructor() {
    this.store = {};
  }

  add(word) {
    let last = this.store;
    word.split('').forEach((letter) => {
      !last[letter] ? last[letter] = {} : null;     
      last = last[letter];
    });

    last['end'] = '$';
  }

  exists(word) {
    let last = this.store;
    word.split('').some((letter) => {
      last = last[letter];
      return last === undefined;
    });

    return !!last && last['end'] === '$';
  }

  remove(word, lastCharacterRemoved = null) {
    let last = this.store;

    if (!word && lastCharacterRemoved) {
      Object.keys(last).forEach((key) => 
        key === lastCharacterRemoved && delete last[key]
      );
      return;
    }

    word.split('').some((letter) => {
      last = last[letter];  
      return last === undefined;
    });

    if (last === undefined) {
      return; // work do not exists
    }

    if (Object.keys(last).length <= 1) {
      let newWord = word.split('');
      const lastCharacter = newWord.pop();
      this.remove(newWord.join(''), lastCharacter);
    }

    switch(true) {    
      case last['end'] && !lastCharacterRemoved:
        delete last['end'];
      break;
      case !!lastCharacterRemoved:      
        delete last[lastCharacterRemoved];
      break;
      default:
      break;
    }
  }

  get() {
    return this.store;
  }
}

class Profiler {
  constructor() {
    this.profiling = {};
  }

  profile(f, name) {
    const start = new Date().getTime();
    f();
    const profilingTime = new Date().getTime() - start;
    
    name = name ? name : f.name;

    if (!this.profiling[name]) {
      this.profiling[name] = {
        executions: []
      };
    }

    this.profiling[name]
      .executions[this.profiling[name].executions.length] = profilingTime;
    
    return profilingTime;
  }

  getAvgExecutionTime(name) {
    if (!name || !this.profiling[name]) {
      throw new Error('No function data found');
    }
    const executions = this.profiling[name].executions;
    return executions.reduce((vA, v, i) => (vA + v)) / executions.length;
  }

  get() {
    return this.profiling;
  }
}

const wordStorage = new WordStorage();
const profiler = new Profiler();

((words) => {
  let store = [];  
  for (let i = 0; i < words; i++) {
    let w = Math.random().toString(36).substring(7);
    store.push(w);
    profiler.profile(wordStorage.add.bind(wordStorage, w), 'add');
  }

  store.forEach((w) => {
    profiler.profile(wordStorage.exists.bind(wordStorage, w), 'exists');
  });

  store.forEach((w) => {
    profiler.profile(wordStorage.remove.bind(wordStorage, w), 'remove');
    wordStorage.add(w);
  });
})(414800);


let t = profiler.getAvgExecutionTime('add');
console.log('add', t);

t = profiler.getAvgExecutionTime('exists');
console.log('exists', t);

t = profiler.getAvgExecutionTime('remove');
console.log('remove', t);
