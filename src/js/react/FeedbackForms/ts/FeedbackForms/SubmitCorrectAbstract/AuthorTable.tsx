import React from 'react';
import DataTable, { IDataTableColumn } from 'react-data-table-component';
import { useFormContext, useWatch } from 'react-hook-form';
import { shallowEqual } from '../../utils';
import { Checkbox, Control, ModalButton } from '../components';
import { Author, SubmitCorrectAbstractFormValues } from '../models';

interface IModifyProps {
  onSubmit: (author: Author) => void;
  author: Author;
  authors: Author[];
}

const Modify: React.FC<IModifyProps> = ({ author, onSubmit, authors }) => {
  const initialState = {
    aff: '',
    id: '',
    name: '',
    position: 0,
    orcid: '',
  };
  const [state, setState] = React.useState<Author>(initialState);
  React.useEffect(() => {
    setState(author);
  }, []);

  const handleSubmit = () => {
    onSubmit(state);

    // reset state
    setState(initialState);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = event.currentTarget;

    if (type === 'number') {
      const num = parseInt(value, 10);
      setState({ ...state, [name]: num - 1 });
    } else {
      setState({ ...state, [name]: value });
    }
  };

  return (
    <ModalButton
      buttonText={
        <>
          <i className="fa fa-pencil" aria-hidden/> Modify
        </>
      }
      buttonStyle="default"
      buttonSize="xs"
      modalTitle="Editing author"
      onSubmit={handleSubmit}
    >
      <Control
        type="text"
        field="name"
        label="Name"
        a11yPrefix="feedback"
        onChange={handleChange}
        defaultValue={author.name}
      />
      <Control
        type="text"
        field="aff"
        label="Affiliation"
        a11yPrefix="feedback"
        onChange={handleChange}
        defaultValue={author.aff}
      />
      <OrcidControl onChange={handleChange} defaultValue={author.orcid}/>
      <div className="form-group">
        <label htmlFor="feedback_author_position_spinner">Position</label>
        <input
          className="form-control"
          id="feedback_author_position_spinner"
          type="number"
          name="position"
          onChange={handleChange}
          defaultValue={author.position + 1}
          max={authors.length}
          min={1}
          step={1}
        />
      </div>
    </ModalButton>
  );
};

/**
 * Editable ORCiD input
 * This creates a toggle button wrapper around the ORCiD edit input
 */
const OrcidControl = ({
  onChange,
  defaultValue,
}: {
  onChange?: React.FormEventHandler<HTMLInputElement>;
  defaultValue: string;
}) => {
  const [showOrcid, setShowOrcid] = React.useState(false);

  const handleToggleOrcid = () => {
    setShowOrcid(!showOrcid);
  };

  const cls = showOrcid
    ? 'btn btn-default btn-xs active'
    : 'btn btn-default btn-xs';

  const faCls = showOrcid ? 'fa fa-chevron-down' : 'fa fa-chevron-right';
  const buttonText = showOrcid ? 'Hide ORCiD' : 'Show ORCiD';

  return (
    <div className="form-group">
      <label htmlFor="feedback-orcid">ORCiD</label>
      <p className="text-small">
        Correct publisher-provided ORCiD information here. To submit an ORCiD
        claim,{' '}
        <a href="/help/orcid/claiming-papers">use our ORCiD interface.</a>
      </p>
      <button
        className={cls}
        type="button"
        role="switch"
        id="toggle-orcid"
        aria-checked={showOrcid}
        onClick={handleToggleOrcid}
      >
        <i aria-hidden="true" className={faCls}/> {buttonText}
      </button>
      {showOrcid && (
        <input
          type="text"
          className="form-control"
          id="feedback-orcid"
          aria-hidden={!showOrcid}
          name="orcid"
          onChange={onChange}
          defaultValue={defaultValue}
          style={{ marginTop: '1rem' }}
          autoFocus
        />
      )}
    </div>
  );
};

interface IAddProps {
  onSubmit: (author: Author) => void;
}

const Add: React.FC<IAddProps> = ({ onSubmit }) => {
  interface AddAuthorType extends Omit<Author, 'name'> {
    firstname: string;
    lastname: string;
  }

  const initialState: AddAuthorType = {
    aff: '',
    id: '',
    firstname: '',
    lastname: '',
    position: -1,
    orcid: '',
  };
  const [state, setState] = React.useState<AddAuthorType>(initialState);

  const handleBeforeClose = async () => {
    // Do not allow submission if nothing was entered
    return !shallowEqual(state, initialState);
  };

  const handleSubmit = () => {
    // Do not allow submission if nothing was entered
    if (shallowEqual(state, initialState)) {
      return;
    }

    const hasNames = state.lastname.length > 0 && state.firstname.length > 0;
    onSubmit({
      ...state,

      // add comma if both names have been entered
      name: `${state.lastname}${hasNames ? ', ' : ''}${state.firstname}`,
    });

    // reset state
    setState(initialState);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setState({ ...state, [name]: value });
  };

  return (
    <ModalButton
      buttonText={
        <>
          <i className="fa fa-plus" aria-hidden/> Add new author
        </>
      }
      buttonStyle="default"
      buttonSize="xs"
      modalTitle="Adding new author"
      onSubmit={handleSubmit}
      beforeClose={handleBeforeClose}
    >
      <Control
        type="text"
        field="firstname"
        label="First Name"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
      <Control
        type="text"
        field="lastname"
        label="Last Name"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
      <Control
        type="text"
        field="aff"
        label="Affiliation"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
      <Control
        type="text"
        field="orcid"
        label="ORCiD"
        a11yPrefix="feedback"
        onChange={handleChange}
      />
    </ModalButton>
  );
};

const getNewAuthorList = (list: Author[], modifiedAuthor: Author): Author[] => {
  // if position changed, remove the old item
  const filteredList = list.filter((e) => e.id !== modifiedAuthor.id);

  // and insert it in the new array
  const newList = [
    ...filteredList.slice(0, modifiedAuthor.position),
    modifiedAuthor,
    ...filteredList.slice(modifiedAuthor.position),
  ];

  // re-apply the positional data
  return newList.map((e, i) => ({ ...e, position: i }));
};

const removeAuthors = (list: Author[], deletions: Author[]) => {
  const ids = deletions.map((d) => d.id);
  return list
    .filter((e) => !ids.includes(e.id))
    .map((e, i) => ({ ...e, position: i }));
};

const AuthorTable: React.FC<IAuthorTableProps> = ({ onChange, authors }) => {
  const [selected, setSelected] = React.useState<Author[]>([]);
  const [clearRows, setClearRows] = React.useState(false);

  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      const newAuthorList = removeAuthors(authors, selected);
      onChange(newAuthorList);
      setClearRows(!clearRows);
      setSelected([]);
    };

    return (
      <button type="button" onClick={handleDelete} className="btn btn-danger">
        Delete
      </button>
    );
  }, [authors, selected, clearRows]);

  const handleModifySubmit = (modifiedAuthor: Author) => {
    const newAuthorList = getNewAuthorList(authors, modifiedAuthor);
    onChange(newAuthorList);
  };

  const handleAddSubmit = (newAuthor: Author) => {
    const newAuthorList = [
      ...authors,
      {
        ...newAuthor,
        position: authors.length,
        id: `${newAuthor.name}_${authors.length}`,
      },
    ];
    onChange(newAuthorList);
  };

  const columns: IDataTableColumn<Author>[] = [
    {
      name: 'Position',
      selector: 'position',
      sortable: true,
      maxWidth: '100px',
      cell: (author) => <span>{author.position + 1}</span>,
    },
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
      maxWidth: '200px',
      cell: (author) => <span>{author.name}</span>,
    },
    {
      name: 'Affiliation',
      selector: 'aff',
      sortable: true,
      cell: (author) => <span>{author.aff}</span>,
    },
    {
      name: 'Orcid',
      selector: 'orcid',
      sortable: true,
      maxWidth: '200px',
      cell: (author) => <span>{author.orcid}</span>,
    },
    {
      name: 'Edit',
      maxWidth: '100px',
      cell: (author) => (
        <Modify
          author={author}
          onSubmit={handleModifySubmit}
          authors={authors}
          key={author.id}
        />
      ),
      button: true,
    },
  ];

  return (
    <>
      {authors.length <= 0 ? (
        <div className="form-group">
          <Add onSubmit={handleAddSubmit}/>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={authors}
          actions={<Add onSubmit={handleAddSubmit}/>}
          customStyles={{
            header: {
              style: {
                flexDirection: 'row-reverse',
                // @ts-ignore
                '&>*': {
                  justifyContent: 'flex-start !important',
                },
              },
            },
          }}
          pagination
          highlightOnHover
          selectableRows
          selectableRowsHighlight
          contextActions={contextActions}
          selectableRowsComponent={Checkbox}
          onSelectedRowsChange={({ selectedRows }) => setSelected(selectedRows)}
          clearSelectedRows={clearRows}
        />
      )}
    </>
  );
};

interface IAuthorTableProps {
  onChange: (...event: any[]) => void;
  authors: Author[];
}

const Wrapper = () => {
  const { setValue, register } = useFormContext();

  React.useEffect(() => {
    register({ name: 'authors' });
  }, [register]);

  const authors = useWatch<SubmitCorrectAbstractFormValues['authors']>({
    name: 'authors',
  });

  const handleChange = (modifiedAuthors: Author[]) => {
    setValue('authors', modifiedAuthors, { shouldDirty: true });
  };

  return <AuthorTable onChange={handleChange} authors={authors || []}/>;
};

export default Wrapper;
