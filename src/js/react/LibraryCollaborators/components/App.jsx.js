define(['react', 'react-bootstrap'], function(React, { Panel }) {
  const App = () => {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3">Library Collaborators</Panel.Title>
        </Panel.Heading>
        <Panel.Body>Panel content</Panel.Body>
      </Panel>
    );
  };

  return App;
});
