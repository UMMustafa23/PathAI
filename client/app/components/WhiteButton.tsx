import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";

type Props = {
  title: string;
  onPress: () => void;
};

export default function WhiteButton({ title, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(onPress);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={styles.button} onPress={animate}>
        <Text style={styles.text}>{title} ➜</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    width: "60%",
    alignSelf: "center",
    marginTop: 20,
  },
  text: {
    color: "#111",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
