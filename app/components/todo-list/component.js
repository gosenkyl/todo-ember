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

  searchText: "",

  filteredTodos: Ember.computed("todos.[]", "filterStatus", "searchText", function(){
    let todos = Ember.get(this, "todos");
    let filterStatus = Ember.get(this, "filterStatus");

    let filteredTodos = "ALL" === filterStatus ? todos : todos.filterBy("status", filterStatus);

    let searchText = Ember.get(this, "searchText");

    if(Ember.isPresent(searchText)) {
      searchText = searchText.toUpperCase();
      filteredTodos = filteredTodos.filter(function (todo){
          return Ember.get(todo, "description").toUpperCase().includes(searchText);
      });
    }

    return filteredTodos;
  }),

  activeTodos: Ember.computed.filterBy("todos", "status", "ACTIVE"),
  activeCount: Ember.computed.reads("activeTodos.length"),

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
