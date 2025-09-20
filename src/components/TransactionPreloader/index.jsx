import { useEffect, useState } from "react";
import { Modal, Progress } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getCurrentCustomMonth } from "../../utils/dateRanges";

const TransactionPreloader = ({ onDone }) => {
  const [visible, setVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const [cache, setCache] = useState(() => {
    const saved = localStorage.getItem("transactionCache");
    return saved ? JSON.parse(saved) : {};
  });

  const navigate = useNavigate();

  // --- Core sync function
  const runSync = async (blocking = false) => {
    const rawSession = localStorage.getItem("sessionData");
    const ses = rawSession ? JSON.parse(rawSession) : null;
    if (!ses || !ses.token) {
      navigate("/");
      return;
    }

    const { uid, password } = ses;

    try {
      const now = new Date();
      const syncStart = now.toISOString();

      const lastSync = localStorage.getItem("lastSyncTime");
      let startTime, endTime;

      if (lastSync) {
        // Incremental sync
        startTime = lastSync;
        endTime = syncStart;
      } else {
        // First time: full current month
        const year = now.getFullYear();
        const currentRange = getCurrentCustomMonth(year);
        startTime = currentRange.start;
        endTime = currentRange.end;
      }

      // --- Fetch employees
      const domain = [["registration_number", "!=", false]];
      const response = await axios.post("/jsonrpc", {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            "odoo",
            uid,
            password,
            "hr.employee",
            "search_read",
            [domain],
            { fields: ["registration_number"] },
          ],
        },
        id: 1,
      });

      const employees = response.data.result || [];
      const total = employees.length;
      let processed = 0;
      const updatedCache = { ...cache };

      for (const emp of employees) {
        const empCode = emp.registration_number;
        if (!updatedCache[empCode]) updatedCache[empCode] = {};

        
      const monthName = getCurrentCustomMonth(new Date().getFullYear())?.name || "Unknown";


        try {
          const txResponse = await axios.get(`/iclock/api/transactions/`, {
            headers: {
              Authorization: `Token ${ses.token}`,
              "Content-Type": "application/json",
            },
            params: {
              emp_code: empCode,
              page_size: "1000",
              start_time: startTime,
              end_time: endTime,
            },
          });

          const txList = txResponse.data.data || [];

          // Deduplicate by transaction id
          const existingIds = new Set(
            (updatedCache[empCode][monthName] || []).map((t) => t.id)
          );
          const newOnes = txList.filter((t) => !existingIds.has(t.id));

          updatedCache[empCode][monthName] = [
            ...(updatedCache[empCode][monthName] || []),
            ...newOnes,
          ];

          // Persist after each employee
          localStorage.setItem("transactionCache", JSON.stringify(updatedCache));
        } catch (err) {
          console.error(`Failed to fetch transactions for ${empCode}`, err);
        }

        processed++;
        if (blocking) {
          setPercent(Math.round((processed / total) * 100));
        }
      }

      // --- Save final cache and update lastSyncTime
      localStorage.setItem("transactionCache", JSON.stringify(updatedCache));
      localStorage.setItem("lastSyncTime", syncStart);
      setCache(updatedCache);

      if (blocking) {
        setVisible(false);
        if (onDone) onDone(updatedCache);
      }
    } catch (err) {
      console.error("Sync failed:", err);
      if (blocking) navigate("/");
    }
  };

  // --- On mount: decide blocking vs background
  useEffect(() => {
    if (Object.keys(cache).length === 0) {
      // First time: block with modal
      setVisible(true);
      runSync(true);
    } else {
      // Already have cache: forward immediately
      if (onDone) onDone(cache); // 👈 navigate right away
      // Run background sync every hour
      runSync(false); // initial background update
      const interval = setInterval(() => runSync(false), 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      maskClosable={false}
    >
      <h3>Preparing your data…</h3>
      <Progress percent={percent} status="active" />
    </Modal>
  );
};

export default TransactionPreloader;
