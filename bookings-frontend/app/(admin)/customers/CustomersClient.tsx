"use client";

import { useState, useMemo, useRef } from "react";
import { Customer, CreateCustomerDto, createCustomer, updateCustomer, deleteCustomer } from "@/lib/api";
import { 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Building, 
  Trash2, 
  Edit3, 
  X, 
  Filter,
  Users,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 }
};

function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div variants={item} className="customer-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="admin-avatar" style={{ borderRadius: "100%", width: "48px", height: "48px", fontSize: "18px" }}>
            {customer.name.charAt(0)}
          </div>
          <div>
            <p className="customer-name" style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>{customer.name}</p>
            <div className="customer-tag" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--primary)", marginTop: "4px", fontWeight: 600 }}>
              <Building size={12} />
              {customer.business || "Sin comercio"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
           <button onClick={() => onEdit(customer)} className="secondary-btn" style={{ padding: "10px" }}>
             <Edit3 size={14} />
           </button>
           <button onClick={() => onDelete(customer.id)} className="secondary-btn" style={{ padding: "10px", color: "var(--accent)" }}>
             <Trash2 size={14} />
           </button>
        </div>
      </div>
      
      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
          <Phone size={14} />
          {customer.phone || "Sin teléfono"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
          <Mail size={14} />
          {customer.email || "Sin email"}
        </div>
      </div>
      
      <div style={{ 
        marginTop: "24px", 
        paddingTop: "16px", 
        borderTop: "1px solid var(--border)", 
        fontSize: "12px", 
        color: "var(--text-muted)",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span>ID: #{customer.id}</span>
        <span>Registrado: {new Date(customer.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}


export default function CustomersClient({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    email: "",
    phone: "",
    business: "",
  });
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    isConfirm?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });
  const showModal = (title: string, message: string, onConfirm?: () => void, isConfirm = false) => 
    setModal({ isOpen: true, title, message, onConfirm, isConfirm });

  const EUROPEAN_PREFIXES = [
    "30", "31", "32", "33", "34", "36", "39", "40", "41", "43", "44", "45", "46", "47", "48", "49",
    "351", "352", "353", "354", "355", "356", "357", "358", "359",
    "370", "371", "372", "373", "374", "375", "376", "377", "378", "379",
    "380", "381", "382", "383", "385", "386", "387", "389",
    "420", "421", "423"
  ];

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    if (val.length > 0 && !val.startsWith("+")) val = "+" + val;
    let digits = val.replace(/[^\d]/g, "");
    
    let prefixLen = 2;
    const threeDigitPrefixes = ["351", "352", "353", "354", "355", "356", "357", "358", "359", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "385", "386", "387", "389", "420", "421", "423"];
    for (let p of threeDigitPrefixes) {
      if (digits.startsWith(p)) {
        prefixLen = 3;
        break;
      }
    }

    let formatted = digits.length > 0 ? "+" : "";
    for (let i = 0; i < digits.length; i++) {
      if (i === prefixLen || i === prefixLen + 3 || i === prefixLen + 6) {
        if (digits[i]) formatted += " ";
      }
      formatted += digits[i];
    }
    setFormData({ ...formData, phone: formatted });
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.business && c.business.toLowerCase().includes(search.toLowerCase()))
    );
  }, [customers, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Trim inputs
    const trimmedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.trim(),
    };

    const phone = trimmedData.phone || "";
    
    // International European Phone Validation
    if (phone.length > 0) {
      // Format: +XX XXX XXX XXX or +XXX XXX XXX XXX
      const phoneRegex = /^\+\d{2,3} \d{3} \d{3} \d{3}$/;
      if (!phoneRegex.test(phone)) {
        showModal("Error", "El formato del numero esta mal");
        return;
      }

      const digits = phone.replace(/[^\d]/g, "");
      let foundPrefix = false;
      for (let p of EUROPEAN_PREFIXES) {
        if (digits.startsWith(p)) {
          foundPrefix = true;
          break;
        }
      }

      if (!foundPrefix) {
        showModal("Error", "El formato del numero esta mal");
        return;
      }
    }

    setLoading(true);
    try {
      if (editingCustomer) {
        const result = await updateCustomer(editingCustomer.id, trimmedData);
        if (result.error) {
          showModal("Aviso", result.error);
        } else {
          setCustomers(customers.map((c) => (c.id === editingCustomer.id ? result : c)));
          setIsFormOpen(false);
          setEditingCustomer(null);
          setFormData({ name: "", email: "", phone: "", business: "" });
        }
      } else {
        const result = await createCustomer(trimmedData);
        if (result.error) {
          showModal("Aviso", result.error);
        } else {
          setCustomers([result, ...customers]);
          setIsFormOpen(false);
          setEditingCustomer(null);
          setFormData({ name: "", email: "", phone: "", business: "" });
        }
      }
    } catch (error) {
      console.error("Error saving customer", error);
      showModal("Error", "No se pudo guardar el cliente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    showModal(
      "Confirmar eliminación",
      "¿Seguro que quieres eliminar este cliente?",
      async () => {
        try {
          await deleteCustomer(id);
          setCustomers(customers.filter((c) => c.id !== id));
          closeModal();
        } catch (error) {
          console.error("Error deleting customer", error);
          showModal("Error", "No se pudo eliminar el cliente.");
        }
      },
      true
    );
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      business: customer.business || "",
    });
    setIsFormOpen(true);
    scrollToForm();
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="page-stack"
    >
      <motion.section variants={item} className="page-hero">
        <div>
          <h2>Directorio de Clientes</h2>
          <p>Base de datos centralizada de todos tus contactos.</p>
        </div>

        <button 
          className="primary-btn" 
          type="button" 
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: "", email: "", phone: "", business: "" });
            setIsFormOpen(true);
            scrollToForm();
          }}
        >
          <UserPlus size={18} />
          <span>Nuevo cliente</span>
        </button>
      </motion.section>

      <AnimatePresence mode="wait">
        {isFormOpen && (
          <motion.section 
            ref={formRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="section-card"
          >
            <div className="panel-title-row">
              <h3 className="panel-title">{editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}</h3>
              <button type="button" className="secondary-btn" onClick={() => setIsFormOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="page-stack" style={{ marginTop: 24, gap: 24 }}>
              <div className="form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Nombre Completo</label>
                  <input
                    className="input"
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Teléfono</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Comercio / Empresa</label>
                  <input
                    className="input"
                    placeholder="Nombre del negocio"
                    value={formData.business}
                    onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <button className="primary-btn" type="submit" disabled={loading}>
                  {loading ? "Guardando..." : (editingCustomer ? "Actualizar Cliente" : "Crear Cliente")}
                </button>
                <button 
                  className="secondary-btn" 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section variants={item} className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              className="input" 
              style={{ paddingLeft: "48px" }}
              placeholder="Buscar por nombre o empresa..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="secondary-btn" type="button">
            <Filter size={16} />
            <span>Filtros avanzados</span>
          </button>
        </div>
      </motion.section>

      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="customer-grid"
      >
        <AnimatePresence>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}
            >
              <Users size={48} style={{ opacity: 0.1, marginBottom: "16px" }} />
              <p style={{ fontSize: "18px" }}>No se encontraron clientes que coincidan con tu búsqueda.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-card"
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>{modal.title}</h3>
              <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", lineHeight: 1.5 }}>{modal.message}</p>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                {modal.isConfirm ? (
                  <>
                    <button className="secondary-btn" onClick={closeModal}>Cancelar</button>
                    <button className="primary-btn" style={{ backgroundColor: "var(--accent)" }} onClick={modal.onConfirm}>Eliminar</button>
                  </>
                ) : (
                  <button className="primary-btn" onClick={closeModal}>Entendido</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

