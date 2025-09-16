import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerMenu({ isOpen, onClick }: HamburgerMenuProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative w-10 h-10 p-0 hover:bg-sidebar-accent transition-colors"
      aria-label="Toggle menu"
    >
      <div className="flex flex-col justify-center items-center w-6 h-6">
        <motion.span
          className="block h-0.5 w-6 bg-sidebar-foreground"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-sidebar-foreground mt-1.5"
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block h-0.5 w-6 bg-sidebar-foreground mt-1.5"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </Button>
  );
}