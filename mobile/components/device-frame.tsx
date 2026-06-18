import { useMemo, useState, type ReactNode } from 'react'
import { Platform, Pressable, Text, useWindowDimensions, View, StyleSheet } from 'react-native'

type DevicePreset = 'phone' | 'tablet' | 'full'

const DEVICES: Record<Exclude<DevicePreset, 'full'>, { label: string; width: number; height: number }> = {
  phone: { label: 'iPhone 15', width: 393, height: 852 },
  tablet: { label: 'iPad', width: 820, height: 1180 },
}

const TOOLBAR_HEIGHT = 44
const STAGE_PADDING = 24

export function DeviceFrame({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<DevicePreset>('phone')
  const { width: windowW, height: windowH } = useWindowDimensions()

  const layout = useMemo(() => {
    const isFull = preset === 'full'
    if (isFull) {
      return { isFull, deviceW: windowW, deviceH: windowH, scale: 1, frameW: windowW, frameH: windowH }
    }

    const device = DEVICES[preset]
    const availW = Math.max(windowW - STAGE_PADDING * 2, 200)
    const availH = Math.max(windowH - TOOLBAR_HEIGHT - STAGE_PADDING * 2, 300)
    const scale = Math.min(1, availW / device.width, availH / device.height)

    return {
      isFull,
      deviceW: device.width,
      deviceH: device.height,
      scale,
      frameW: device.width * scale,
      frameH: device.height * scale,
    }
  }, [preset, windowW, windowH])

  if (Platform.OS !== 'web') {
    return <>{children}</>
  }

  const { isFull, deviceW, deviceH, scale, frameW, frameH } = layout

  return (
    <View style={styles.shell}>
      <View style={styles.toolbar}>
        {(Object.keys(DEVICES) as Array<keyof typeof DEVICES>).map((key) => (
          <Pressable
            key={key}
            onPress={() => setPreset(key)}
            style={[styles.chip, preset === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, preset === key && styles.chipTextActive]}>
              {DEVICES[key].label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setPreset('full')}
          style={[styles.chip, preset === 'full' && styles.chipActive]}
        >
          <Text style={[styles.chipText, preset === 'full' && styles.chipTextActive]}>Full</Text>
        </Pressable>
        {!isFull && (
          <Text style={styles.sizeHint}>
            {deviceW}×{deviceH} @ {Math.round(scale * 100)}%
          </Text>
        )}
      </View>

      <View style={styles.stage}>
        {isFull ? (
          <View style={styles.frameFull}>{children}</View>
        ) : (
          <View style={[styles.scaleBox, { width: frameW, height: frameH }]}>
            <View
              style={[
                styles.device,
                {
                  width: deviceW,
                  height: deviceH,
                  transform: [{ scale }],
                },
              ]}
            >
              {children}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#111113',
    // @ts-expect-error web layout
    minHeight: '100vh',
  },
  toolbar: {
    height: TOOLBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#27272a',
  },
  chipActive: {
    backgroundColor: '#c45c26',
  },
  chipText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  sizeHint: {
    color: '#71717a',
    fontSize: 11,
    marginLeft: 8,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: STAGE_PADDING,
  },
  scaleBox: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#3f3f46',
    backgroundColor: '#000',
    // @ts-expect-error web shadow
    boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
  },
  device: {
    overflow: 'hidden',
    backgroundColor: '#f7f5f2',
    // @ts-expect-error web transform origin
    transformOrigin: 'top left',
  },
  frameFull: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#f7f5f2',
  },
})
