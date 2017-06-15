export default function(){

  this.namespace = 'api';

  this.get('/todos', (schema) => {
    return schema.db.todos;
  });

  this.post('/todos', (schema, request) => {
    let todo = JSON.parse(request.requestBody);

    return schema.db.todos.insert(todo);
  });

}
