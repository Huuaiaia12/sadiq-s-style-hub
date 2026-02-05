import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  onAddToCart: (productId: string) => void;
  index: number;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  imageUrl,
  onAddToCart,
  index,
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-xl overflow-hidden group"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold gold-text">{price.toFixed(2)} د.ع</span>
          <Button
            onClick={() => onAddToCart(id)}
            size="sm"
            className="bg-gold hover:bg-gold/90 text-primary-foreground"
          >
            <ShoppingCart className="w-4 h-4 ml-1" />
            اطلب
          </Button>
        </div>
      </div>
    </motion.div>
  );
};