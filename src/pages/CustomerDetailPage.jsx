import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContextValue";
import { useParams, Link } from "react-router";
import { API_BASE } from "../App";
import AddInteractionForm from "../components/AddInteractionForm";
import Spinner from "../components/Spinner";
import styles from "./CustomerDetailPage.module.css";

function CustomerDetailPage() {
  // customers/1234
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const { isAuthenticated, authenticatedFetch } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const controller = new AbortController();

    const loadDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const [customerResponse, interactionsResponse] = await Promise.all([
          authenticatedFetch(`${API_BASE}/customers/${id}`, {
            signal: controller.signal,
          }),
          authenticatedFetch(`${API_BASE}/customers/${id}/interactions`, {
            signal: controller.signal,
          }),
        ]);

        if (!customerResponse.ok) {
          throw new Error(
            `Failed to load customer: ${customerResponse.status}`,
          );
        }

        if (!interactionsResponse.ok) {
          throw new Error(
            `Failed to load interactions: ${interactionsResponse.status}`,
          );
        }

        const [customerData, interactionsData] = await Promise.all([
          customerResponse.json(),
          interactionsResponse.json(),
        ]);

        if (!controller.signal.aborted) {
          setCustomer(customerData);
          setInteractions(interactionsData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => controller.abort();
  }, [id, isAuthenticated, authenticatedFetch]);

  if (loading) {
    return (
      <div className={styles.panel}>
        <Spinner size={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Error: {error}</p>
        <Link to="/app/customers">Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <Link to="/app/customers" className={styles.backLink}>
        ← Back to Customers
      </Link>

      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.name}>
            {customer.firstName} {customer.lastName}
          </h2>
          {customer.company && (
            <p className={styles.company}>{customer.company}</p>
          )}
        </div>
        <Link to={`/app/customers/${id}/edit`} className={styles.editButton}>
          Edit
        </Link>
      </div>

      <div>
        <p className={styles.contactRow}>{customer.email}</p>
        {customer.phone && (
          <p className={styles.contactRow}>{customer.phone}</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status and tags</p>
        <div className={styles.tags}>
          <span
            className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
          >
            {customer.status}
          </span>
          {(customer.tags ?? []).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Notes</p>
        {customer.notes ? (
          <p className={styles.notes}>{customer.notes}</p>
        ) : (
          <p className={styles.notesEmpty}>No notes yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Customer since</p>
        <p className={styles.contactRow}>{customer.createdAt}</p>
      </div>

      <AddInteractionForm
        customerId={id}
        onSuccess={(savedInteraction) =>
          setInteractions((prev) => [...prev, savedInteraction])
        }
      />
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Interaction History</p>
        {interactions.length === 0 ? (
          <p className={styles.notesEmpty}>No interactions logged yet.</p>
        ) : (
          <ul className={styles.interactionList}>
            {interactions.map((interaction) => (
              <li key={interaction.id}>
                <strong>{interaction.interactionType}</strong>
                <strong>{interaction.interactionDate}</strong>
                <p>{interaction.remarks}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CustomerDetailPage;
