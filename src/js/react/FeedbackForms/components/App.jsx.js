define([
  'react',
  'suit',
  'react-redux',
  'styled-components',
  '../models/index',
], function(React, { FeedbackForms }, { useSelector }, styled, { FORMS }) {
  const Container = styled.div`
    padding: 4rem 1rem;
  `;

  const formSelector = ({ main }) => ({ form: main.form });
  const App = () => {
    const { form } = useSelector(formSelector);

    return (
      <Container className="container">
        {(() => {
          switch (form) {
            case FORMS.missingreferences:
              return <FeedbackForms.MissingIncorrectRecord />;
            case FORMS.associatedarticles:
              return <FeedbackForms.AssociatedReferences />;
            case FORMS.correctabstract:
              return <FeedbackForms.SubmitCorrectAbstract />;
            default:
              return <FeedbackForms.SubmitCorrectAbstract />;
          }
        })()}
      </Container>
    );
  };

  return App;
});
