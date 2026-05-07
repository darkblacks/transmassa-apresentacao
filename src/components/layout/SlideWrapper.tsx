import { motion } from "framer-motion";

type SlideWrapperProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: string;
};

export default function SlideWrapper({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: SlideWrapperProps) {
  return (
    <motion.section
      className="slide"
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="slide-content">
        {eyebrow && <span className="slide-eyebrow">{eyebrow}</span>}

        <h1>{title}</h1>

        {subtitle && <p className="slide-subtitle">{subtitle}</p>}

        {children && <div className="slide-body">{children}</div>}
      </div>

      {footer && <span className="slide-footer-note">{footer}</span>}
    </motion.section>
  );
}