'use client';

import { Box, Text } from '@gluestack-ui/themed';
import React from 'react';

const VersionBox = () => {
    return (
        <Box
            position="absolute"
            bottom={1}
            left={1}
            opacity={0.9}
        >
            <Text
                fontSize="$xs"
                color="$black"
                fontWeight="$small"
                textAlign='right'
            >
                v0.4.1-pilot
            </Text>
        </Box>
    );
}

export default VersionBox;
