import CustomCredentials from "@/components/CustomCredentials";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="min-h-screen  bg-background text-foreground overflow-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: "#1f1f1f",
            color: "#f5f5f5",
            border: "1px solid #3a3a3a",
          },
        }}
      />
      <CustomCredentials />
    </div>
  );
};

export default App;
