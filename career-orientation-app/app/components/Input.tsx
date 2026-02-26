import { TextInput, StyleSheet, View, ViewStyle, TextStyle } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
};

export default function Input({
  value,
  onChangeText,
  placeholder,
  secure,
  containerStyle,
  inputStyle,
}: Props) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9A9AA0"
        secureTextEntry={secure}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#2B2B30",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: "#DCDCE0",
    fontFamily: "Poppins_400Regular",
  },
});
