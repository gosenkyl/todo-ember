export default function(){

  this.namespace = 'api';

  this.get('/todos', () => {

    return {
      todos: [
        {id: 1, description: "Learn Ember", status: "ACTIVE"},
        {id: 2, description: "Grocery Shopping", status: "ACTIVE"},
        {id: 3, description: "Clean House", status: "ACTIVE"}
      ]
    }

  });

}
