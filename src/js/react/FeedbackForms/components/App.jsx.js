import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FORMS } from '../models/index';
import { AssociatedReferences, MissingIncorrectRecord, SubmitCorrectAbstract } from '../ts/FeedbackForms/index.ts';

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
            return <MissingIncorrectRecord />;
          case FORMS.associatedarticles:
            return <AssociatedReferences />;
          case FORMS.correctabstract:
            return <SubmitCorrectAbstract />;
          default:
            return <SubmitCorrectAbstract />;
        }
      })()}
    </Container>
  );
};

export default App;
