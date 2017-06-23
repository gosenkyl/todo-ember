import Ember from 'ember';
import {task} from 'ember-concurrency';

export default Ember.Component.extend({

  store: Ember.inject.service("store"),

  todos: Ember.A(),

  createTodo: null,

  filterStatus: "ALL",
  isFilterAll: Ember.computed.equal("filterStatus", "ALL"),
  isFilterActive: Ember.computed.equal("filterStatus", "ACTIVE"),
  isFilterCompleted: Ember.computed.equal("filterStatus", "COMPLETED"),

  filteredTodos: Ember.computed("todos.[]", "todos.@each.status", "filterStatus", function(){
    let todos = Ember.get(this, "todos");
    let filterStatus = Ember.get(this, "filterStatus");
    if("ALL" === filterStatus){
      return todos;
    }

    return todos.filterBy("status", filterStatus);
  }),

  init(){
    this._super(...arguments);

    Ember.get(this, "fetchData").perform();
  },

  fetchData: task(function * (){
    let todos = yield Ember.get(this, "store").findAll("todo");
    Ember.set(this, "todos", todos);
  }),

  postData: task(function * (description){
    let todo = {id: Math.random() * 100, description: description, status: "ACTIVE"};

    let model = Ember.get(this, "store").createRecord("todo", todo);
    yield model.save();
    Ember.set(this, "createTodo", null);
  }),

  deleteData: task(function * (todo){
    yield todo.destroyRecord();
  }),

  updateData: task(function * (todo){
    yield todo.save();
  }),

  actions: {
    onCreateTodo(){
      Ember.get(this, "postData").perform(this.get("createTodo"));
    },

    onFilter(status){
      Ember.set(this, "filterStatus", status);
    },

    onDelete(todo){
      Ember.get(this, "deleteData").perform(todo);
    },

    onUpdateStatus(todo){
      let currentStatus = Ember.get(todo, "status");
      let updatedStatus = currentStatus === "ACTIVE" ? "COMPLETED" : "ACTIVE";

      Ember.set(todo, "status", updatedStatus);

      Ember.get(this, "updateData").perform(todo);
    }
  }

});
