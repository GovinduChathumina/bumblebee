import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Form,
  FormGroup,
  Alert,
  Table,
} from 'reactstrap';
import Http from '../Http';
import '../css/Dashboard.css';
import StatBox from '../components/StatBox';

class Dashboard extends Component {
  state = {
    todo: '',
    success: null,
    data: [],
    editingId: null,
    editingValue: '',
    quotes: [],
    currentQuote: ''
  };

  api = '/api/v1/todo';

  componentDidMount() {
    this.fetchQuotes().then(quotes => {
      this.setState({ quotes }, this.setRandomQuote);
    });

    Http.get(`${this.api}?status=open`)
      .then((response) => {
        const { data } = response.data;
        this.setState({
          data,
        });
      });
  }

  fetchQuotes = () => {
    return Http.get('https://type.fit/api/quotes')
      .then(response => response.data)
      .catch(error => {
        console.error("Error fetching quotes:", error);
        return [];
      });
  };

  setRandomQuote = () => {
    const { quotes } = this.state;
    if (quotes.length) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      this.setState({ currentQuote: quotes[randomIndex].text });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { todo } = this.state;
    this.addTodo(todo);
  };

  addTodo = (todo) => {
    Http.post(this.api, { value: todo })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          value: todo,
        };
        const allTodos = [newItem, ...this.state.data];
        this.setState({ data: allTodos, todo: '', success: 'To do added successfully!' });
        setTimeout(() => {
          this.setState({ success: null });
        }, 3000);
        this.todoForm.reset();
      });
  };

  closeTodo = (e) => {
    const { key } = e.target.dataset;
    const { data: todos } = this.state;

    Http.patch(`${this.api}/${key}`, { status: 'closed' })
      .then(() => {
        const updatedTodos = todos.filter((todo) => todo.id !== parseInt(key, 10));
        this.setState({ data: updatedTodos, success: 'To do closed successfully!' });
        setTimeout(() => {
          this.setState({ success: null });
        }, 3000);
      });
  };

  startEditing = (id, value) => {
    this.setState({
      editingId: id,
      editingValue: value,
    });
  };

  cancelEditing = () => {
    this.setState({
      editingId: null,
      editingValue: '',
    });
  };

  saveTodo = (id) => {
    const { editingValue, data } = this.state;
    Http.patch(`${this.api}/${id}`, { value: editingValue })
      .then(() => {
        const updatedTodos = data.map((todo) =>
          todo.id === id ? { ...todo, value: editingValue } : todo,
        );
        this.setState({
          data: updatedTodos,
          editingId: null,
          editingValue: '',
          success: 'To do updated successfully!',
        });
        setTimeout(() => {
          this.setState({ success: null });
        }, 3000);
      });
  };

  render() {
    const { data, success, todo, editingId, editingValue, currentQuote } = this.state;

    return (
      <div className="container py-5">
        <StatBox title="Total Tasks" value={data.length} />
        <Card className="mb-5 shadow-sm">
          <CardHeader className="card-header text-white text-center custom-header">
            <h1 className='card-header'>Add a To Do</h1>
          </CardHeader>
          <CardBody>
            <Form
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.todoForm = el;
              }}
            >
              <FormGroup>
                <label htmlFor="addTodo" className='title-header'>Add a New To Do</label>
                <div className="d-flex">
                  <Input
                    id="addTodo"
                    name="todo"
                    className="form-control"
                    placeholder="Build a To Do app..."
                    value={todo}
                    onChange={this.handleChange}
                    required
                  />
                  <Button type="submit" color="primary" className="ml-3 solid-button">
                    Add
                  </Button>
                </div>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>

        {success && <Alert className='alert-header'>{success}</Alert>}

        <Card className="shadow-sm">
          <CardHeader className="card-header text-white text-center custom-header">
            <h1 className='card-header'>Open To Dos</h1>
          </CardHeader>
          <CardBody>
            <Table striped responsive>
              <thead>
                <tr>
                  <th className='title-header'>To Do</th>
                  <th className='title-header'>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((todo) => (
                  <tr key={todo.id}>
                    <td>
                      {editingId === todo.id ? (
                        <Input
                          type="text"
                          value={editingValue}
                          onChange={(e) => this.setState({ editingValue: e.target.value })}
                        />
                      ) : (
                        todo.value
                      )}
                    </td>
                    <td>
                      <div className="button-group d-flex justify-content-end">
                        {editingId === todo.id ? (
                          <>
                            <Button color="success" onClick={() => this.saveTodo(todo.id)} className="mr-2">
                              Save
                            </Button>
                            <Button color="danger" onClick={this.cancelEditing}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={this.closeTodo}
                              data-key={todo.id}
                              className="mr-2 solid-button-close"
                            >
                              Close
                            </Button>
                            <Button
                              className='solid-button'
                              onClick={() => this.startEditing(todo.id, todo.value)}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <Card className="shadow-sm mt-5">
          <CardHeader className="card-header text-white text-center custom-header">
            <h1 className='card-header'>Inspirational Quote</h1>
          </CardHeader>
          <CardBody>
            <p>{currentQuote}</p>
            <Button className='solid-button' onClick={this.setRandomQuote}>
              New Quote
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Dashboard);
