import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BorderRadius, Fonts, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { useBuildStore } from '../../stores/build.store';

export default function CreateBuildScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createBuild = useBuildStore((s) => s.createBuild);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Build name is required.');
      return;
    }
    if (trimmedName.length > 60) {
      setError('Build name cannot exceed 60 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newId = await createBuild(trimmedName, description.trim() || undefined);
      router.replace(`/builds/${newId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create build.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backIconText, { color: theme.text }]}>←</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts?.sans }]}>
            Create New Build
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
          Give your custom PC configuration a name to start selecting compatible components.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            Shadows.sm,
          ]}
        >
          {/* Build Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.text, fontFamily: Fonts?.sans }]}>
                Build Name <Text style={{ color: theme.tertiary }}>*</Text>
              </Text>
              <Text
                style={[
                  styles.charCount,
                  {
                    color: name.length > 60 ? theme.error : theme.textSecondary,
                    fontFamily: Fonts?.sans,
                  },
                ]}
              >
                {name.length}/60
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              placeholder="e.g. RTX 4080 Gaming Rig, Office Workstation"
              placeholderTextColor={theme.textSecondary}
              maxLength={60}
              autoFocus
              accessibilityLabel="Build name input"
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: error ? theme.error : theme.border,
                  color: theme.text,
                  fontFamily: Fonts?.sans,
                },
              ]}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.text, fontFamily: Fonts?.sans }]}>
                Description (Optional)
              </Text>
              <Text
                style={[
                  styles.charCount,
                  {
                    color: description.length > 200 ? theme.error : theme.textSecondary,
                    fontFamily: Fonts?.sans,
                  },
                ]}
              >
                {description.length}/200
              </Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Built for 1440p gaming and video editing workflow."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
              accessibilityLabel="Build description input"
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                  color: theme.text,
                  fontFamily: Fonts?.sans,
                },
              ]}
            />
          </View>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: theme.error + '1A', borderColor: theme.error },
              ]}
            >
              <Text style={[styles.errorIcon, { color: theme.error }]}>⚠</Text>
              <Text
                style={[styles.errorText, { color: theme.error, fontFamily: Fonts?.sans }]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.cancelButton,
                { borderColor: theme.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: theme.textSecondary, fontFamily: Fonts?.sans },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create Build"
              disabled={isSubmitting || !name.trim()}
              onPress={handleCreate}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: theme.secondary,
                  opacity: isSubmitting || !name.trim() ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating...' : '✓ Create Build'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  errorIcon: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
