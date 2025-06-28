const SelectContent = ({ children, ...props }: any) => (
  <div className="bg-white shadow-lg z-50 border border-gray-200 rounded-md" {...props}>
    {children}
  </div>
);
export default SelectContent; 