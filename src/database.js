import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class DataBase {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }
  //salva as informações em arquivo
  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  // Criação de uma task
  insertTask(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }
    this.#persist();
  }

  // Listagem de todas as tasks
  selectTasks(table, search) {
    let data = this.#database[table] ?? [];
    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    return data;
  }

  // Atualização de uma task pelo id
  updateTask(table, id, data) {
    const taskIndex = this.#database[table].findIndex((task) => task.id === id);
    if (taskIndex > -1) {
      this.#database[table][taskIndex] = { id, ...data };
      this.#persist();
    }
  }

  //Remover uma task pelo id
  deleteTask(table, id) {
    const taskIndex = this.#database[table].findIndex((task) => task.id === id);
    if (taskIndex > -1) {
      this.#database[table].splice(taskIndex, 1);
      this.#persist();
    }
  }
}
