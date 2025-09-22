import axios from "axios";
import { ApartmentOutlined } from "@ant-design/icons";

// Helper for Ant Design menu items
const getItem = (label, key, icon = null, children = null) => ({
  key,
  label,
  icon,
  children
});


export const fetchDepartments = async () => {
  const rawSession = localStorage.getItem("sessionData");
  const ses = rawSession ? JSON.parse(rawSession) : null;

  if (!ses || !ses.token) {
    return [];
  }

  try {
    const response = await axios.post("/jsonrpc", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "odoo",
          ses.uid,
          ses.password,
          "hr.department",
          "search_read",
          [[]],
          { fields: ["name"] }
        ]
      },
      id: 1
    });

    return response.data.result || [];
  } catch (err) {
    console.error("Failed to load departments:", err);
    return [];
  }
};


// Build Ant Design menu items from departments
export const buildDepartmentMenu = (departments) => {
  const children = departments.map(dept =>
    getItem(dept.name, `dept-${dept.name}`)
  );

  return [
    getItem("Departments", "sub-departments", <ApartmentOutlined />, children)
  ];
};
