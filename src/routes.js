import { DataBase } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new DataBase();

export const routes = [
  {
    // Rota de criação um task
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      //converter data para pt BR
      let date = new Date();
      let dateNow = date.toLocaleString("pt-BR");

      if (!title) {
        return res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Title is required." }));
      }
      if (!description) {
        return res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Description is required." }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: dateNow,
        updated_at: dateNow,
      };
      database.insertTask("tasks", task);
      return res.writeHead(201).end();
    },
  },
  {
    // Rota de Listagem as tasks
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const getTasks = database.selectTasks(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      return res.end(JSON.stringify(getTasks));
    },
  },
  {
    // Rota de atualizar uma task
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      let date = new Date();
      let dateNow = date.toLocaleString("pt-BR");

      if (!title || !description) {
        return res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "title or description is required." }));
      }

      const [getTasks] = database.selectTasks("tasks", { id });
      if (!getTasks) {
        return res.writeHead(404).end();
      }

      database.updateTask("tasks", id, {
        title,
        description,
        updated_at: dateNow,
      });
      return res.writeHead(204).end();
    },
  },
  {
    // Rota de atualizar uma task
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.insertTask("tasks", { id });
      if (!task) {
        return res.writeHead(404).end();
      }

      database.deleteTask("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.selectTasks("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }
      let date = new Date();
      let dateNow = date.toLocaleString("pt-BR");

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : dateNow;

      database.updateTask("tasks", id, { completed_at });

      return res.writeHead(204).end();
    },
  },
];
