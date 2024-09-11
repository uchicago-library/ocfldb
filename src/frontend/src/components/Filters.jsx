import SearchIcon from "./icons/SearchIcon";

const Filters = ({ columnFilters, setColumnFilters }) => {
  const taskName = columnFilters.find((f) => f.id === "task")?.value || "";

  const onFilterChange = (id, value) =>
    setColumnFilters((prev) =>
      prev
        .filter((f) => f.id !== id)
        .concat({
          id,
          value,
        })
    );

  return (
    <div>
      <div>
        <div>
          <div as={SearchIcon} />
        </div>
        <input
          type="text"
          value={taskName}
          onChange={(e) => onFilterChange("task", e.target.value)}
        />
      </div>
    </div>
  );
};
export default Filters;
