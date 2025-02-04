import { motion } from "framer-motion"
import { FileText, User, Mail, Building2, Award } from "lucide-react"
export default function AnimatedResumeIllustration() {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-72 h-72">
          {/* Background circle */}
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
  
          {/* Center resume icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FileText className="w-20 h-20 text-primary" />
          </motion.div>
  
          {/* Orbiting icons */}
          {[User, Mail, Building2, Award].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                rotate: [0, 360],
                x: Math.cos(index * (Math.PI / 2)) * 120,
                y: Math.sin(index * (Math.PI / 2)) * 120,
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                rotate: {
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }