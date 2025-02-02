const {
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  isNonNullType,
  isScalarType,
  isListType,
  GraphQLID
} = require('graphql')
const { ConstraintStringType, validate: validateStringFn } = require('../scalars/string')
const { ConstraintNumberType, validate: validateNumberFn } = require('../scalars/number')

function getConstraintTypeObject (fieldName, type, uniqueTypeName, directiveArgumentMap) {
  if (type === GraphQLString || type === GraphQLID) {
    return new ConstraintStringType(
      fieldName,
      uniqueTypeName,
      type,
      directiveArgumentMap
    )
  } else if (type === GraphQLFloat || type === GraphQLInt) {
    return new ConstraintNumberType(
      fieldName,
      uniqueTypeName,
      type,
      directiveArgumentMap
    )
  } else {
    throw new Error(`Not a valid scalar type: ${type.toString()}`)
  }
}

function getConstraintValidateFn (type) {
  if (type === GraphQLString || type === GraphQLID) {
    return validateStringFn
  } else if (type === GraphQLFloat || type === GraphQLInt) {
    return validateNumberFn
  } else {
    throw new Error(`Not a valid scalar type: ${type.toString()}`)
  }
}

function getScalarType (fieldConfig, options) {
  if (isScalarType(fieldConfig)) {
    const scalarTypeMappings = options?.pluginOptions?.scalarTypeMappings
    if (scalarTypeMappings != null) {
      const scalarType = scalarTypeMappings[fieldConfig.name]
      if (scalarType) return { scalarType: scalarType }
    }
    return { scalarType: fieldConfig }
  } else if (isListType(fieldConfig)) {
    return { ...getScalarType(fieldConfig.ofType, options), list: true }
  } else if (isNonNullType(fieldConfig) && isScalarType(fieldConfig.ofType)) {
    return { scalarType: fieldConfig.ofType, scalarNotNull: true }
  } else if (isNonNullType(fieldConfig)) {
    return { ...getScalarType(fieldConfig.ofType.ofType, options), list: true, listNotNull: true }
  } else {
    throw new Error(`Not a valid scalar type: ${fieldConfig.toString()}`)
  }
}

module.exports = { getConstraintTypeObject, getConstraintValidateFn, getScalarType }
