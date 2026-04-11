import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false, message = "Waking up the server..." }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-main)]"
    : "flex flex-col items-center justify-center p-8 w-full h-full";

  return (
    <div className={containerClasses}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Rings */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary-500/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-4 border-primary-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.h2 
            className="text-xl font-bold tracking-tight text-[var(--text-main)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            NexChat <span className="text-primary-500">Elite</span>
          </motion.h2>
          <motion.p 
            className="text-sm text-[var(--text-muted)] font-medium"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
