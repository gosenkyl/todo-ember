export default function(){

  this.namespace = 'api';

  this.get('/todos', (schema) => {
    return schema.db.todos;
  });

  this.post('/todos', (schema, request) => {
    let todo = JSON.parse(request.requestBody);

    return schema.db.todos.insert(todo);
  });

  this.put('/todos/:id', (schema, request) => {
    let todo = JSON.parse(request.requestBody);

    return schema.db.todos.update(request.params.id, todo);
  });

  this.del('/todos/:id', (schema, request) => {
    let id = request.params.id;

    return schema.db.todos.remove({id: id});
  });

}
