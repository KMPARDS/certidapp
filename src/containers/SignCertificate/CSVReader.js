import React from 'react';

const CSVReader = ({
  inputId,
  style,
  onFileLoaded,
  onError
}) => {
  let fileContent = undefined;

  const handleChangeFile = e => {
    try {
      let reader = new FileReader();
      const filename = e.target.files[0].name;

      reader.onload = event => {
        // const csvData = PapaParse.parse(
        //   ,
        //   Object.assign(parserOptions, {
        //     error: onError
        //   })
        // );
        onFileLoaded(event.target.result, filename);
      };

      reader.readAsText(e.target.files[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <input
        type="file"
        id={inputId}
        style={style}
        accept=".csv, text/csv"
        onChange={e => handleChangeFile(e)}
      />
    </div>
  );
};

export default CSVReader;
