import axios from "axios";
import { ApartmentOutlined } from "@ant-design/icons";
import EmployeeTable from "../components/EmployeeTable";

// Helper for Ant Design menu items
function getItem(label, key, icon, component = null, isParent = false, children = null) {
  return {
    key,
    icon,
    label,
    component,
    isParent,
    children
  };
}


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




export const buildDepartmentMenu = (departments) => {
  const children = departments.map(dept =>
    getItem(dept.name, `dept-${dept.id}`, null, null, false, null)
  );

  // ✅ Add "All" at the beginning
  children.unshift(
    getItem("الكل", "dept-all", null, null, false, null)
  );

  return [
    getItem("الأقسام", "sub-departments", <ApartmentOutlined />, null, true, children)
  ];
};
