import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
};

export default function GradientButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={["#6C63FF", "#A66CFF"]}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  gradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
});
