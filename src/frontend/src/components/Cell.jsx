const Cell = ({ getValue, row, column, table }) => {
  return (
    <div>{getValue()}</div>
  );
};
export default Cell;
